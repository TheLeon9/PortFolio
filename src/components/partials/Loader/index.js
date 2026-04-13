//=============================================================================
// Loader — Initial loading screen with logo, percentage and 3D handoff
//
// Sequence:
//   1. Tick a fake percentage from 0 → 97 with random increments.
//   2. Snap from 97 to 100 once 97 is hit.
//   3. After a short pause, fade out the loader UI.
//   4. Animate the loader corners off-screen, slide the wobble sphere into
//      its resting Z position, flip the wave plane down to 90°, and slide
//      the WELCOME text into the centre.
//   5. Once everything is in place, call `setLoader(false)` so the Layout
//      can render the rest of the UI.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React, { useState, useEffect, useRef, useCallback } from 'react';

import Image from 'next/image';

// Three.js — only used here for the deg→rad helper inside the wave plane tween.
import { MathUtils } from 'three';
// GSAP drives every loader-side animation.
import { gsap } from 'gsap';

// Inner reusable components.
import Sentence from '@/components/UI/Sentence';
import MusicButton from '@/components/UI/MusicButton';

// Loader assets served from /public.
import LogoWhiteAnimated from 'p/img/loading/logo_fm_white_animated.svg';
import BlueCircle from 'p/img/loading/blue_ornament_circle.svg';

// CSS module: full-screen overlay, corner masks, percentage typography.
import style from './index.module.scss';

//-- Constants ----------------------------------------------------------------

// Tick interval for the fake progress (ms). Lower = faster perceived loading.
const PROGRESS_INTERVAL_MS = 40;

// We hold at this value until we force a snap to 100, so the loader feels
// like it lingers at "almost done" instead of jumping straight to 100.
const PROGRESS_CAP = 97;

/**
 * Loader
 * Receives the wobble sphere / wave plane / text refs from the Layout so it
 * can drive the handoff animation directly on the Three.js objects.
 *
 * @param {Object} props
 * @param {Object} props.wobbleRef       - React ref → wobble sphere mesh
 * @param {Object} props.wobblePlateRef  - React ref → wave plane mesh
 * @param {Object} props.textRef         - React ref → text Group
 * @param {Function} props.setLoader     - setter to flip Layout out of loading state
 */
const Loader = ({ wobbleRef, wobblePlateRef, setLoader, textRef }) => {
  //-- State / Refs -----------------------------------------------------------

  // Fake progress 0..100.
  const [percentage, setPercentage] = useState(0);

  // Flag flipped once we are ready to fade the loader UI out.
  const [endAnimation, setEndAnimation] = useState(false);

  // Refs to the DOM nodes we animate on the way out.
  const loaderContCenterRef = useRef(null); // central logo + percentage block
  const loaderContMusicRef = useRef(null);  // bottom music selector block
  const cornerLeftRef = useRef(null);       // top-left decorative corner
  const cornerRightRef = useRef(null);      // top-right decorative corner

  //-- Effects ----------------------------------------------------------------

  // Tick the fake percentage from 0 → 97 with random increments.
  useEffect(() => {
    const interval = setInterval(() => {
      setPercentage((prev) =>
        prev < PROGRESS_CAP ? prev + Math.floor(Math.random() * 3) + 1 : prev
      );
    }, PROGRESS_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  // Force the snap from PROGRESS_CAP → 100 once we hit the cap.
  useEffect(() => {
    if (percentage >= PROGRESS_CAP && percentage < 100) {
      setPercentage(100);
    }
  }, [percentage]);

  // Once we hit 100, wait 400ms then trigger the fade-out sequence.
  useEffect(() => {
    if (percentage === 100) {
      const timeout = setTimeout(() => setEndAnimation(true), 400);
      return () => clearTimeout(timeout);
    }
  }, [percentage]);

  //-- Handlers ---------------------------------------------------------------

  /**
   * animateCorners
   * Last leg of the handoff: slide the corners off-screen, animate the
   * wobble sphere / wave plane / WELCOME text into their resting positions,
   * then flip the loader off after 1.2s.
   *
   * Wrapped in `useCallback` because it's referenced in the dependency
   * array of the fade-out effect below.
   */
  const animateCorners = useCallback(() => {
    setTimeout(() => {
      // Slide the two top corners off the viewport.
      gsap.to(cornerLeftRef.current, { duration: 2, left: '-60%' });
      gsap.to(cornerRightRef.current, { duration: 2, right: '-60%' });

      // Pull the wobble sphere from its boot Z (6) back to its resting Z (0).
      gsap.to(wobbleRef.current.position, {
        z: 0,
        duration: 2,
        ease: 'power1.inOut',
      });

      // Flip the wave plane from 100° down to 90° (lays it flat below the sphere).
      gsap.to(wobblePlateRef.current.rotation, {
        x: MathUtils.degToRad(90),
        duration: 2,
        ease: 'power1.inOut',
      });

      // Slide the WELCOME text from its boot position to (0, 0, -4).
      const welcome = textRef?.current?.getObjectByName('welcome');
      if (welcome) {
        gsap.to(welcome.position, {
          x: 0,
          y: 0,
          z: -4,
          duration: 2,
          ease: 'power1.inOut',
        });
      }

      // After the 2s tweens have had time to settle, flip the loader off.
      setTimeout(() => setLoader(false), 1200);
    }, 400);
  }, [wobbleRef, wobblePlateRef, setLoader, textRef]);

  // Fade the loader UI (centre block + music block) out, then call
  // `animateCorners` to start the 3D handoff.
  useEffect(() => {
    if (endAnimation) {
      gsap.to([loaderContCenterRef.current, loaderContMusicRef.current], {
        duration: 0.5,
        autoAlpha: 0,
        onComplete: animateCorners,
      });
    }
  }, [endAnimation, animateCorners]);

  //-- Render -----------------------------------------------------------------
  return (
    <div className={style.loader_cont}>
      {/* Decorative corners — animated off-screen during handoff. */}
      <div ref={cornerLeftRef} className={style.loader_corner_left}></div>
      <div ref={cornerRightRef} className={style.loader_corner_right}></div>

      {/* Central block: blue circle ornament + animated logo + percentage. */}
      <div ref={loaderContCenterRef} className={style.loader_cont_center}>
        <Image
          src={BlueCircle}
          alt="BlueCircle"
          width={120}
          height={120}
          className={style.blue_circle}
          priority
          fetchPriority="high"
        />
        <Image
          src={LogoWhiteAnimated}
          alt="Logo FM White"
          width={120}
          height={120}
          className={style.loader_logo_white}
          priority
          fetchPriority="high"
        />
        <div className={style.loader_text_cont}>
          <p className={style.loader_percentage}>{percentage}</p>
          {/* White variant of the animated sentence — `loading` activates the dot animation. */}
          <Sentence white="true" loading />
        </div>
      </div>

      {/* Bottom block: music selector + tooltip text. */}
      <div ref={loaderContMusicRef} className={style.music_wrapper}>
        <div className={`${style.music_selector_cont} hover_target_big`}>
          <MusicButton />
        </div>
        <p className={style.text_music}>
          We use ambient sound to make your experience more immersive.
        </p>
      </div>
    </div>
  );
};

export default Loader;
