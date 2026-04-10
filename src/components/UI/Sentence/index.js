//=============================================================================
// Sentence — Animated "Imagine • Create • Inspire" tagline
//
// Used both by the Loader (white variant on dark background) and by the
// SectionPresentation header (dark variant on light background). The
// `white` prop is a string ("true" / "false") for backwards compatibility
// with how it's passed from JSX attributes.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React, { useEffect, useState } from 'react';

// CSS module — owns the typography + the animated dot styles.
import style from './index.module.scss';

/**
 * Sentence
 * Stateless on the surface but uses local state to flip between the light
 * and dark variants based on the `white` prop.
 *
 * @param {Object} props
 * @param {string} props.white   - "true" for the light variant, anything else for dark.
 * @param {boolean} props.loading - When true, the dots play a loading animation.
 */
const Sentence = (props) => {
  //-- State / Refs -----------------------------------------------------------
  // Local state mirrors the `white` prop. We could compute this on the fly,
  // but the original component used local state and we keep it for parity.
  const [color, setColor] = useState(true);

  //-- Effects ----------------------------------------------------------------
  // Sync local state with the prop on every change.
  useEffect(() => {
    if (props.white === 'true') {
      setColor(true);
    } else setColor(false);
  }, [props.white]);

  //-- Render -----------------------------------------------------------------
  return (
    <h2
      className={
        color
          ? `${style.loader_title_white} ${style.loader_title}`
          : `${style.loader_title_black} ${style.loader_title}`
      }
    >
      Imagine{' '}
      {/* Decorative dot between words — animates when `loading` is true. */}
      <div
        aria-hidden="true"
        className={`${style.word_dot} ${props.loading ? style.word_dot_loading : ''}`}
      ></div>
      Create{' '}
      <div
        aria-hidden="true"
        className={`${style.word_dot} ${props.loading ? style.word_dot_loading : ''}`}
      ></div>
      Inspire
    </h2>
  );
};

export default Sentence;
