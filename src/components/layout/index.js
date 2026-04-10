//=============================================================================
// Layout — Global wrapper: 3D scene init, per-section animations, floating UI
//
// This is the heart of the React side of the portfolio. Responsibilities:
//   1. Mount the Three.js scene once (via initThreeScene) and tear it down
//      on unmount.
//   2. Hold every React ref that the Three.js scene needs (sphere, plane,
//      groups, camera, cursor, ...).
//   3. Listen to scrollProgress from the ThemeContext and run the per-
//      section 3D animations (Home, About, Projects, Skills, Contact).
//   4. Push colour changes (ColorPicker) into the three layers (uniforms,
//      canvas textures, CSS variables) on every theme change.
//   5. Render the floating UI (Cursor, NavBar, ColorPicker, ChatBot, ...)
//      around the canvas.
//=============================================================================

//-- Imports ------------------------------------------------------------------
// React core hooks.
import React, { useState, useEffect, useRef } from 'react';

// `next/dynamic` is used for lazy-loading the non-critical UI partials so
// the initial bundle stays small and the canvas appears as fast as possible.
import dynamic from 'next/dynamic';

// Global theme/scroll/active section state.
import { useTheme } from '@/context/ThemeContext.js';

// Public API of the Three.js scene module.
import {
  initThreeScene,
  initDebugGUI,
  stopThreeScene,
  updateAboutGlassColor,
  updateProjectBandsColor,
  updateSkillsColor,
  updateRadialColor,
  syncDebugDisplay,
  isSecondColorManual,
} from '@/utils/initThreeScene';

// Static data: user info, skills and projects.
import { userList, skillsList, projectsList } from '@/constants';

// Critical UI components — loaded immediately because they appear from the
// very first frame (loader, custom cursor, error boundary).
import Loader from '@/components/partials/Loader';
import Cursor from '@/components/layout/Cursor';
import ErrorBoundary from '@/components/layout/ErrorBoundary';

// Non-critical UI partials — lazy loaded (`ssr: false` so they only mount
// client-side, after hydration).
const NavBar = dynamic(() => import('@/components/partials/NavBar'), {
  ssr: false,
});
const ScrollBtn = dynamic(() => import('@/components/partials/ScrollBtn'), {
  ssr: false,
});
const ShareBtn = dynamic(() => import('@/components/partials/ShareBtn'), {
  ssr: false,
});
const ColorPicker = dynamic(() => import('@/components/partials/ColorPicker'), {
  ssr: false,
});
const MusicSelector = dynamic(
  () => import('@/components/partials/MusicSelector'),
  { ssr: false }
);
const ScrollProgress = dynamic(
  () => import('@/components/partials/ScrollProgress'),
  { ssr: false }
);
const ChatBot = dynamic(() => import('@/components/partials/ChatBot'), {
  ssr: false,
});
const Portrait_Overlay = dynamic(
  () => import('@/components/partials/Portrait_Overlay'),
  { ssr: false }
);

// CSS module for the layout shell.
import style from './index.module.scss';

/**
 * Layout
 * Compose the Three.js scene, animate it section by section based on the
 * scroll progress, and render the floating React UI around the canvas.
 *
 * The per-section 3D animations used to live in a giant `useEffect` here,
 * re-running on every React render of `scrollProgress`. They have been
 * moved into `src/utils/three/sectionAnimations.js` and are now called
 * directly from the RAF loop in `animationLoop.js`, so React is no longer
 * on the hot path of a scroll.
 */
const Layout = ({ children }) => {
  //-- State / Refs -----------------------------------------------------------

  // Pull global state from the ThemeContext.
  const {
    mainColor,                // current main colour (hex)
    setMainColor,             // setter (used by the debug GUI callback)
    backgroundColor,          // current background colour (hex)
    TransmissionLevel,        // glass transparency 0..1
    activeSection,            // 0..4 detected from scrollProgress
    scrollProxyRef,           // live scroll proxy ref (read each frame in RAF)
    scrollToSection,          // programmatic scroll for the home button
  } = useTheme();

  // Loader visibility — true until the loader animation finishes.
  const [isLoading, setLoader] = useState(true);

  // Refs to every Three.js object the React side needs to control. They are
  // populated by `initThreeScene` and read by the section animation effect.
  const wobbleRef = useRef();        // central wobble sphere
  const wobblePlateRef = useRef();   // wave plane
  const customUniforms = useRef();   // shared shader uniforms
  const textRef = useRef();          // text Group
  const cameraRef = useRef();        // cameraGroup (parallax-friendly)
  const glassRef = useRef();         // about glass Group
  const projectsRef = useRef();      // projects Group
  const skillsRef = useRef();        // skills Group
  const cursorRef = useRef(null);    // <div> of the custom cursor

  // Guard so the scene is initialised only once even under React strict mode
  // (which mounts effects twice in dev).
  const initialized = useRef(false);

  //-- Effects ----------------------------------------------------------------

  // Init the Three.js scene on mount; tear it down on unmount.
  useEffect(() => {
    if (!initialized.current) {
      initThreeScene({
        canvasId: 'webgl',
        mainColor,
        backgroundColor,
        TransmissionLevel,
        wobbleRef,
        wobblePlateRef,
        customUniforms,
        textRef,
        cameraRef,
        glassRef,
        projectsRef,
        skillsRef,
        cursorRef,
        // The RAF loop calls this every frame to read the live scroll value
        // straight from the proxy ref — no React re-render involved.
        getScrollProgress: () => scrollProxyRef?.current?.value ?? 0,
        skillsList,
        projectsList,
      });
      initialized.current = true;
    }

    return () => {
      // stopThreeScene cancels the RAF loop and disposes every resource.
      stopThreeScene();
      // Allow re-init on remount (HMR / strict mode double-mount).
      initialized.current = false;
    };
    // We intentionally want this effect to run only once on mount.
  }, []);

  // Debug GUI — only mounted when `#debug` is in the URL. We retry once
  // after 100ms because the hash might not be ready on the very first render.
  useEffect(() => {
    const tryInitDebug = () => {
      if (window.location.hash.includes('debug')) {
        initDebugGUI({ setMainColor });
      }
    };

    const timer = setTimeout(tryInitDebug, 100);
    // Also re-check when the hash changes so the user can toggle debug
    // mode without reloading.
    window.addEventListener('hashchange', tryInitDebug);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', tryInitDebug);
    };
  }, []);

  // Propagate colour changes to the three layers:
  //   1) GPU shader uniforms (real-time)
  //   2) The CanvasTexture-based meshes (About / Projects / Skills)
  //   3) The CSS variables consumed by the React UI
  useEffect(() => {
    // 1) Update the wobble shader colour.
    customUniforms.current?.uMainColor.value.set(mainColor);
    // Only update the second colour if the user has not overridden it via
    // the debug GUI.
    if (!isSecondColorManual()) {
      customUniforms.current?.uSecondColor.value.set(backgroundColor);
    }

    // Update the wobble material transmission level.
    if (wobbleRef.current?.material) {
      wobbleRef.current.material.transmission = TransmissionLevel;
    }

    // Update the radial background gradient.
    updateRadialColor(mainColor);

    // Walk the text group and update each letter's two materials
    //   - material[0] = front face = background colour
    //   - material[1] = side face  = main colour
    textRef.current?.traverse((child) => {
      if (child.isMesh && Array.isArray(child.material)) {
        child.material[0].color.set(backgroundColor);
        child.material[1].color.set(mainColor);
      }
    });

    // 2) Repaint every CanvasTexture-based mesh.
    updateAboutGlassColor(mainColor, backgroundColor);
    updateProjectBandsColor(mainColor, backgroundColor);
    updateSkillsColor(mainColor, backgroundColor);

    // Sync the debug GUI sliders so they reflect the new colours.
    syncDebugDisplay(mainColor, backgroundColor);
  }, [mainColor, backgroundColor, TransmissionLevel]);

  // (The giant per-section 3D animation effect that used to live here has
  //  been moved into `src/utils/three/sectionAnimations.js`. It is now
  //  invoked by the RAF loop in `animationLoop.js` so React no longer
  //  re-renders on every scroll tick.)

  //-- Render -----------------------------------------------------------------
  return (
    <div className={style.global_cont}>
      {/* 3D canvas wrapped in an error boundary so a Three.js crash never
          breaks the React tree. */}
      <ErrorBoundary>
        <canvas className={style.webgl} id="webgl"></canvas>
      </ErrorBoundary>

      {/* Mobile-portrait overlay asking the user to rotate the device. */}
      <Portrait_Overlay />

      {/* Custom global cursor (no-op on touch devices). */}
      <Cursor cursorRef={cursorRef} />

      {/* Loader covers the screen until the intro animation is done. */}
      {isLoading ? (
        <Loader
          setLoader={setLoader}
          wobbleRef={wobbleRef}
          wobblePlateRef={wobblePlateRef}
          textRef={textRef}
        />
      ) : (
        // Once the loader is gone, render every floating UI element.
        <>
          <NavBar />

          {/* Centre Home button (FM logo) — scrolls back to section 0. */}
          <div className={style.home_btn_cont}>
            <button
              onClick={() => scrollToSection(0)}
              className={`${style.home_btn} hover_target_big`}
              aria-label="Go to home"
            >
              <svg
                role="img"
                aria-label="Logo FM Black"
                width="144"
                height="144"
                viewBox="0 0 144 144"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={style.home_logo}
              >
                <path
                  d="M73.4956 2.99123L2.99121 73.4956L53.7544 124.259L65.0351 112.978L45.2938 93.2368L65.0351 73.4956L53.7544 62.2149L34.0131 81.9561L25.5526 73.4956L84.7763 14.2719L73.4956 2.99123Z"
                  fill="#0132b5"
                  className="svg_color"
                />
                <path
                  d="M73.4956 65.0351L62.2149 53.7544L93.2368 22.7325L144 73.4956L73.4956 144L62.2149 132.719L121.439 73.4956L112.978 65.0351L73.4956 104.518L62.2149 93.2368L101.697 53.7544L93.2368 45.2939L73.4956 65.0351Z"
                  fill="#0132b5"
                  className="svg_color"
                />
                <path
                  d="M70.5044 1.46416e-05L0 70.5044L50.7632 121.268L62.0439 109.987L42.3026 90.2456L62.0439 70.5044L50.7632 59.2237L31.0219 78.9649L22.5614 70.5044L81.7851 11.2807L70.5044 1.46416e-05Z"
                  fill="#040B12"
                />
                <path
                  d="M70.5044 62.0439L59.2237 50.7632L90.2456 19.7412L141.009 70.5044L70.5044 141.009L59.2237 129.728L118.447 70.5044L109.987 62.0439L70.5044 101.526L59.2237 90.2456L98.7061 50.7632L90.2456 42.3026L70.5044 62.0439Z"
                  fill="#040B12"
                />
              </svg>
            </button>
          </div>

          {/* Floating UI partials. Order doesn't matter visually because each
              partial positions itself absolutely. */}
          <ShareBtn />
          <ScrollProgress />
          <ChatBot />
          <ColorPicker />
          <ScrollBtn />
          <MusicSelector />

          {/* Inject the active section index into the page child so it can
              decide which section component to render. */}
          {React.cloneElement(children, { activeSection })}
        </>
      )}
    </div>
  );
};

export default Layout;
