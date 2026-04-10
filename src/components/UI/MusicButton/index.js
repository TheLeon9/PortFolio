//=============================================================================
// MusicButton — Play/pause button for the ambient music
//
// Renders 12 vertical bars that animate in a CSS bouncing keyframe when the
// audio is active. The actual playback is handled by ThemeContext through
// `toggleMusic` and `musicActive`.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React from 'react';

// Theme context exposes the music state and the toggle.
import { useTheme } from '@/context/ThemeContext.js';

// CSS module — bar layout, animation classes, label container.
import style from './index.module.scss';

//-- Constants ----------------------------------------------------------------
// Number of equaliser bars rendered inside the button.
const BARS_COUNT = 12;

/**
 * MusicButton
 * Reads the music state from ThemeContext, renders the toggle button and
 * the equaliser bars, and forwards click events to `toggleMusic`.
 */
const MusicButton = () => {
  //-- State / Refs -----------------------------------------------------------
  // `musicActive` drives the visual state; `toggleMusic` flips it on click.
  const { musicActive, toggleMusic } = useTheme();

  //-- Render -----------------------------------------------------------------
  return (
    <button
      className={style.music_btn}
      onClick={toggleMusic}
      // Aria label adapts to the current state for screen readers.
      aria-label={musicActive ? 'Pause music' : 'Play music'}
    >
      {/* Equaliser line — 12 bars with staggered animation delays. */}
      <div className={style.music_line}>
        {[...Array(BARS_COUNT)].map((_, idx) => (
          <span
            key={idx}
            className={`${style.bar} ${
              musicActive ? style.active : style.not_active
            }`}
            // Stagger each bar's animation by 100ms so the wave reads as a
            // continuous motion across the row.
            style={{ animationDelay: `${idx * 0.1}s` }}
          ></span>
        ))}

        {/* Two gradient overlays mask the bars on each side, so the wave
            appears to fade out at the edges. */}
        <div className={style.hide_left}></div>
        <div className={style.hide_right}></div>
      </div>
      {/* On/off text label next to the bars. */}
      <div className={style.music_text_cont}>
        <p className={style.music_text}>{musicActive ? 'on' : 'off'}</p>
      </div>
    </button>
  );
};

export default MusicButton;
