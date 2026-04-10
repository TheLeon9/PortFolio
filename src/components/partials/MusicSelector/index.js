//=============================================================================
// MusicSelector — Wrapper around the MusicButton with a styled container
//
// The MusicButton is reused inside the Loader; this partial is the floating
// version pinned to the corner of the layout once the loader is gone.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React from 'react';

// Reusable music toggle (handles its own state via ThemeContext).
import MusicButton from '@/components/UI/MusicButton';

// Container styles (positioning, hover, fade-in animation).
import style from './index.module.scss';

/**
 * MusicSelector
 * Pure wrapper — no logic, just CSS.
 */
const MusicSelector = () => {
  //-- Render -----------------------------------------------------------------
  return (
    // `hover_target_big` is read by the global Cursor component to enlarge
    // the cursor when the user mouses over the music selector.
    <div className={`${style.music_selector_cont} hover_target_big`}>
      <MusicButton />
    </div>
  );
};

export default MusicSelector;
