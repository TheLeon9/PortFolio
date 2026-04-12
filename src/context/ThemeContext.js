//=============================================================================
// ThemeContext — Global state for colours, scroll progress, music, sections
//
// Exposes a single Context that holds:
//   • theme colours (main / background / text) and the transparency level
//   • the ambient music state
//   • the form-sent flag (Contact section)
//   • the custom scroll progress (0..100) + active section index
//   • a programmatic `scrollToSection` helper used by the NavBar
//   • a `getSectionProgress(scroll, range)` helper used by Layout animations
//
// The custom scroll system replaces the native browser scroll: we listen to
// wheel/keyboard/touch events, integrate them into a target value, and lerp
// the public state toward that target every animation frame.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';

// GSAP — used by `scrollToSection` to animate the scroll target smoothly.
import gsap from 'gsap';

// Default colours / transparency + the section ranges (used to detect the
// active section from `scrollProgress`).
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_MAIN_COLOR,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TRANSMISSION_LEVEL,
  sections,
} from '@/constants';

//-- Constants ----------------------------------------------------------------

// Exponential-decay constant used by the frame-rate independent smoothing.
// `1 - exp(-decay * dt)` produces the lerp factor for each frame, so the
// effective smoothing speed is the same on a 60 Hz, 120 Hz or stuttering
// display. Higher values = snappier follow, lower values = heavier feel.
// 6.32 reproduces the old 60 Hz feel exactly (1 - exp(-6.32/60) ≈ 0.10),
// while staying consistent on 120 Hz / drops.
const SCROLL_SMOOTH_DECAY = 6.32;

// Below this delta, we skip the React state update entirely. The proxy keeps
// converging in the background. 0.005 is small enough to be invisible to
// the eye but still divides the per-second re-render count by ~5 vs. the
// original 0.001 threshold.
const REACT_UPDATE_THRESHOLD = 0.005;

// How much each pixel of (normalised) wheel deltaY contributes to the
// scroll target. The wheel handler normalises across deltaMode first so
// this factor is consistent regardless of the input device.
const WHEEL_STEP_FACTOR = 0.005;

// Hard cap on the per-event step (avoids huge jumps when the user spins
// the wheel hard).
const WHEEL_STEP_MAX = 1.5;

// Touch sensitivity factor — applied to the delta between two touchmove events.
const TOUCH_STEP_FACTOR = 0.05;

// Reference values used by `normalizeWheelDelta` to convert line-mode and
// page-mode wheel events into pixel-equivalent values.
const WHEEL_LINE_HEIGHT = 16;
const WHEEL_PAGE_HEIGHT = 800;

// React Context object — created at module load.
const ThemeContext = createContext();

//-- Helpers ------------------------------------------------------------------

/**
 * Clamp helper. Default range is [0, 100] which matches the scroll model.
 */
const clamp = (v, a = 0, b = 100) => Math.min(Math.max(v, a), b);

/**
 * normalizeWheelDelta
 * Browsers report wheel events in three different units depending on the
 * input device:
 *   • deltaMode 0 (default) — pixels (Mac trackpad: ~10, Win precision pad)
 *   • deltaMode 1           — lines  (classic Win mouse wheel: ~3)
 *   • deltaMode 2           — pages  (rare; PageDown-style scroll)
 *
 * Without normalisation, the same `WHEEL_STEP_FACTOR` produces a buttery
 * scroll on a Mac trackpad and big jerky steps on a Windows mouse. We
 * convert lines/pages to a pixel-equivalent value so the rest of the
 * pipeline can treat every wheel event the same way.
 */
const normalizeWheelDelta = (e) => {
  let delta = e.deltaY;
  if (e.deltaMode === 1) delta *= WHEEL_LINE_HEIGHT;
  else if (e.deltaMode === 2) delta *= WHEEL_PAGE_HEIGHT;
  return delta;
};

/**
 * ThemeProvider
 * Wraps the entire React tree (mounted in `_app.js`). Holds every piece of
 * global state and exposes them through `useTheme()`.
 */
export const ThemeProvider = ({ children }) => {
  //-- State / Refs -----------------------------------------------------------

  // Theme colour state — defaults come from the constants file.
  const [mainColor, setMainColor] = useState(DEFAULT_MAIN_COLOR);
  const [backgroundColor, setBackgroundColor] = useState(
    DEFAULT_BACKGROUND_COLOR
  );
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);
  const [TransmissionLevel, SetTransmissionLevel] = useState(
    DEFAULT_TRANSMISSION_LEVEL
  );

  // Ambient music state + the audio element ref (created lazily on mount).
  const [musicActive, setMusicActive] = useState(false);
  const audioRef = useRef(null);

  // Contact form: persists between section swaps so the success banner
  // stays visible if the user scrolls away and back.
  const [messageSent, setMessageSent] = useState(false);

  // Custom scroll state.
  // `activeSection` is 0..4 and recomputed from `scrollProgress` whenever
  // it changes. `scrollProgress` is the smoothed public value used by
  // every animation effect.
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  // Mutable proxy used by the rAF loop. We update React state through
  // `setScrollProgress` only when the value actually changes (perf).
  const proxyRef = useRef({ value: 0 });
  // The "target" value the proxy is lerping toward. Updated by every input
  // handler (wheel, key, touch, gsap tween).
  const targetRef = useRef(0);

  //-- Effects ----------------------------------------------------------------

  // Lazily create the <audio> element on mount and clean it up on unmount.
  useEffect(() => {
    audioRef.current = new Audio('/audio/ambiance.mp3');
    audioRef.current.preload = 'none';
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    return () => {
      audioRef.current.pause();
      audioRef.current = null;
    };
  }, []);

  // Play / pause the audio whenever `musicActive` changes.
  useEffect(() => {
    if (!audioRef.current) return;
    if (musicActive) {
      // play() returns a promise that rejects on autoplay restrictions —
      // catch the rejection and pause silently in that case.
      audioRef.current.play().catch(() => audioRef.current.pause());
    } else {
      audioRef.current.pause();
    }
  }, [musicActive]);

  // Wire up the custom scroll input handlers + the rAF lerp loop. Runs once
  // on mount.
  useEffect(() => {
    const proxy = proxyRef.current;
    let animationFrameId;

    /**
     * isInsideScrollable
     * The chat window is the only place where we want native scroll: we
     * mark it with `data-allow-scroll` and bail out of our handlers if the
     * event originated from inside that subtree.
     */
    const isInsideScrollable = (e) => {
      const target = e.target;
      return target && target.closest && target.closest('[data-allow-scroll]');
    };

    /**
     * handleWheel
     * Normalise the wheel event across deltaMode (pixel/line/page) and
     * convert it into a scroll step before adding it to the target.
     */
    const handleWheel = (e) => {
      if (isInsideScrollable(e)) return;
      e.preventDefault();
      const delta = normalizeWheelDelta(e);
      const step =
        Math.sign(delta) *
        Math.min(Math.abs(delta) * WHEEL_STEP_FACTOR, WHEEL_STEP_MAX);
      targetRef.current = clamp(targetRef.current + step, 0, 100);
    };

    /**
     * handleKeyDown
     * Arrow keys move by 0.5 %, PageUp/PageDown by 5 %, Home/End jump to
     * the extremes. Skipped while the user is typing in an input/textarea.
     */
    const handleKeyDown = (e) => {
      // Don't intercept keys if the user is editing an input field.
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      let step = 0;
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          step = 0.5;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          step = -0.5;
          break;
        case 'PageDown':
          step = 5;
          break;
        case 'PageUp':
          step = -5;
          break;
        case 'Home':
          targetRef.current = 0;
          break;
        case 'End':
          targetRef.current = 100;
          break;
        default:
          // Any other key is left untouched (browser handles it normally).
          return;
      }
      e.preventDefault();
      targetRef.current = clamp(targetRef.current + step, 0, 100);
    };

    // Track the previous touch Y so we can compute deltas in `touchmove`.
    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      if (isInsideScrollable(e)) return;
      e.preventDefault();
      const touchY = e.touches[0].clientY;
      const delta = touchStartY - touchY;
      touchStartY = touchY;
      targetRef.current = clamp(
        targetRef.current + delta * TOUCH_STEP_FACTOR,
        0,
        100
      );
    };

    // Last frame timestamp + last value pushed into React state. Both are
    // local to this useEffect so they reset cleanly on remount.
    let lastTime = performance.now();
    let lastReactValue = proxy.value;

    /**
     * update
     * RAF callback. Uses an exponential-decay lerp driven by the actual
     * frame deltaTime, so the smoothing is identical at 60 Hz, 120 Hz or
     * during a frame drop. React state is only updated when the proxy has
     * moved more than `REACT_UPDATE_THRESHOLD` since the last push, which
     * cuts the per-second re-render count by an order of magnitude.
     */
    const update = (now) => {
      // deltaTime in seconds, capped to 0.1 s to avoid huge jumps when the
      // tab regains focus after a long idle period.
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const current = proxy.value;
      const target = targetRef.current;
      // Frame-rate independent lerp factor: t = 1 - e^(-decay * dt)
      const t = 1 - Math.exp(-SCROLL_SMOOTH_DECAY * dt);
      const newValue = current + (target - current) * t;
      proxy.value = newValue;

      // Push to React state only when the change crosses the threshold OR
      // when we've snapped to the exact target (so the UI lands on the
      // final value instead of stopping just short).
      if (
        Math.abs(newValue - lastReactValue) > REACT_UPDATE_THRESHOLD ||
        (newValue !== lastReactValue && newValue === target)
      ) {
        lastReactValue = newValue;
        setScrollProgress(newValue);
      }
      animationFrameId = requestAnimationFrame(update);
    };

    // Attach every input listener.
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    // Kick off the RAF loop.
    animationFrameId = requestAnimationFrame(update);

    // Cleanup: detach handlers + cancel the RAF loop.
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Recompute the active section every time `scrollProgress` changes.
  useEffect(() => {
    let sectionIndex = sections.findIndex(
      (s) => scrollProgress >= s.range[0] && scrollProgress <= s.range[1]
    );

    // Defensive fallback for the edge of the range (rounding error or out
    // of bounds).
    if (sectionIndex === -1) {
      sectionIndex = scrollProgress <= 0 ? 0 : sections.length - 1;
    }

    // Only re-set if the section actually changed (avoids needless renders).
    setActiveSection((prev) => (sectionIndex !== prev ? sectionIndex : prev));
  }, [scrollProgress]);

  //-- Handlers ---------------------------------------------------------------

  /** Toggle the ambient music. Memoised because it goes into the context value. */
  const toggleMusic = useCallback(() => setMusicActive((prev) => !prev), []);

  /**
   * scrollToSection
   * Animate the scroll target toward the start of the requested section
   * range. Used by the NavBar (chevrons + dots) and the Layout home button.
   */
  const scrollToSection = useCallback((index) => {
    if (index < 0 || index >= sections.length) return;

    const [min] = sections[index].range;
    // Add 1 so the new value lands strictly inside the section, not on the
    // exact boundary (which would be ambiguous for `findIndex` above).
    const target = clamp(min + 1);

    // Cancel any in-flight tween targeting the same ref before starting a
    // new one — avoids two animations fighting for `targetRef.current`.
    gsap.killTweensOf(targetRef);
    gsap.to(targetRef, {
      current: target,
      duration: 2,
      ease: 'power3.inOut',
    });
  }, []);

  /**
   * getSectionProgress
   * Map the global scroll value to a 0..1 progress relative to a section.
   * Used by Layout's animation effect to drive every per-section tween.
   */
  const getSectionProgress = useCallback((scroll, range) => {
    const [min, max] = range;
    return Math.min(Math.max((scroll - min) / (max - min), 0), 1);
  }, []);

  //-- Context value ----------------------------------------------------------
  // Memoised so unrelated re-renders of the provider don't invalidate the
  // value object identity (which would re-render every consumer).
  //
  // `scrollProxyRef` is the live proxy object holding the smoothed scroll
  // value (`scrollProxyRef.current.value`). Three.js consumers (Layout) read
  // it on every RAF frame so the 3D scene animates without ever waking up
  // React. The `scrollProgress` state still exists for components that
  // genuinely need to re-render (the `ScrollProgress` percentage display).
  const contextValue = useMemo(
    () => ({
      mainColor,
      setMainColor,
      backgroundColor,
      setBackgroundColor,
      textColor,
      setTextColor,
      TransmissionLevel,
      SetTransmissionLevel,
      musicActive,
      setMusicActive,
      toggleMusic,
      messageSent,
      setMessageSent,
      scrollProgress,
      setScrollProgress,
      scrollProxyRef: proxyRef,
      activeSection,
      setActiveSection,
      scrollToSection,
      getSectionProgress,
    }),
    [
      mainColor,
      backgroundColor,
      textColor,
      TransmissionLevel,
      musicActive,
      toggleMusic,
      messageSent,
      scrollProgress,
      activeSection,
      scrollToSection,
      getSectionProgress,
    ]
  );

  //-- Render -----------------------------------------------------------------
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme
 * Tiny hook so consumers don't have to import `useContext` and the context
 * object every time. `useTheme()` returns the full context value object.
 */
export const useTheme = () => useContext(ThemeContext);
