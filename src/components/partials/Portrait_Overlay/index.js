//=============================================================================
// Portrait_Overlay — Overlay forcing landscape orientation on mobile portrait
//
// Mounts a full-screen overlay that is hidden by default and only shown by
// the matching CSS media query (`max-width: $mobile and orientation: portrait`).
// The overlay shows a rotation hint so users on a phone in portrait mode
// know to flip their device.
//
// All SVGs are inlined so they pick up `currentColor` and follow the theme.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React from 'react';

// CSS module: overlay layout, ornaments, responsive show/hide.
import styles from './index.module.scss';

//-- Constants ----------------------------------------------------------------
// (None — every magic number is local to the SVG markup below.)

/**
 * Ornament
 * Reusable decorative SVG used in all four corners of the overlay. The
 * `currentColor` strokes let the parent component swap the colour via CSS.
 */
const Ornament = ({ className }) => (
  <svg
    className={className}
    width="60"
    height="61"
    viewBox="0 0 60 61"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Curved arcs forming the corner motif. */}
    <path
      d="M59.9989 21.9989C47.9929 21.9989 38.26 12.2659 38.26 0.259766"
      stroke="currentColor"
    />
    <path
      d="M59.9995 26.3467C45.5923 26.3467 33.9128 14.6672 33.9128 0.259766"
      stroke="currentColor"
      strokeWidth="2"
    />
    {/* Straight lines (top + right edges of the corner). */}
    <line y1="1" x2="34.7823" y2="1" stroke="currentColor" strokeWidth="2" />
    <line
      x1="58.9995"
      y1="60.2595"
      x2="58.9995"
      y2="25.477"
      stroke="currentColor"
      strokeWidth="2"
    />
    <line
      x1="52.5432"
      y1="52.4348"
      x2="52.5432"
      y2="0.260975"
      stroke="currentColor"
    />
    <line
      x1="7.82642"
      y1="7.58423"
      x2="59.9998"
      y2="7.58423"
      stroke="currentColor"
    />
    {/* Diagonal lines forming the small "X" details. */}
    <line
      y1="-0.5"
      x2="9.56517"
      y2="-0.5"
      transform="matrix(0.707104 0.70711 -0.707104 0.70711 10.4351 1.12915)"
      stroke="currentColor"
    />
    <line
      y1="-0.5"
      x2="9.56517"
      y2="-0.5"
      transform="matrix(0.707104 0.70711 -0.707104 0.70711 52.1692 42.8693)"
      stroke="currentColor"
    />
    <line
      y1="-0.5"
      x2="9.56517"
      y2="-0.5"
      transform="matrix(0.707104 0.70711 -0.707104 0.70711 15.6506 1.12915)"
      stroke="currentColor"
    />
    <line
      y1="-0.5"
      x2="9.56517"
      y2="-0.5"
      transform="matrix(0.707104 0.70711 -0.707104 0.70711 52.1692 37.6511)"
      stroke="currentColor"
    />
    {/* Final two lines closing the corner. */}
    <line
      x1="53.0432"
      y1="0.62915"
      x2="59.9997"
      y2="0.62915"
      stroke="currentColor"
    />
    <line
      x1="59.4995"
      y1="7.21606"
      x2="59.4995"
      y2="0.259548"
      stroke="currentColor"
    />
  </svg>
);

/**
 * RotateIcon
 * Inline SVG showing two phone outlines (portrait + landscape) plus an
 * arrow suggesting the rotation direction.
 */
const RotateIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Portrait phone (greyed out via opacity). */}
    <rect
      x="30"
      y="20"
      width="30"
      height="50"
      rx="4"
      stroke="currentColor"
      strokeWidth="2"
      opacity="0.3"
    />
    <circle cx="45" cy="64" r="2" fill="currentColor" opacity="0.3" />

    {/* Landscape phone (full opacity = "the goal state"). */}
    <rect
      x="55"
      y="45"
      width="50"
      height="30"
      rx="4"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="99" cy="60" r="2" fill="currentColor" />

    {/* Curved arrow from portrait to landscape + arrow tip. */}
    <path
      d="M50 35 C60 25, 75 30, 70 45"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path d="M68 39 L70 46 L63 44" fill="currentColor" />
  </svg>
);

/**
 * Portrait_Overlay
 * Stateless overlay — shown / hidden purely by CSS media queries.
 */
const Portrait_Overlay = () => {
  //-- Render -----------------------------------------------------------------
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Rotate your device">
      {/* Header: brand logo at the top. */}
      <div className={styles.header}>
        <svg
          role="img"
          aria-label="Logo FM"
          viewBox="0 0 144 144"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.header_logo}
        >
          <path
            d="M73.4956 2.99123L2.99121 73.4956L53.7544 124.259L65.0351 112.978L45.2938 93.2368L65.0351 73.4956L53.7544 62.2149L34.0131 81.9561L25.5526 73.4956L84.7763 14.2719L73.4956 2.99123Z"
            className="svg_color"
          />
          <path
            d="M73.4956 65.0351L62.2149 53.7544L93.2368 22.7325L144 73.4956L73.4956 144L62.2149 132.719L121.439 73.4956L112.978 65.0351L73.4956 104.518L62.2149 93.2368L101.697 53.7544L93.2368 45.2939L73.4956 65.0351Z"
            className="svg_color"
          />
          <path
            d="M70.5044 1.46416e-05L0 70.5044L50.7632 121.268L62.0439 109.987L42.3026 90.2456L62.0439 70.5044L50.7632 59.2237L31.0219 78.9649L22.5614 70.5044L81.7851 11.2807L70.5044 1.46416e-05Z"
            fill="#FFFFFF"
          />
          <path
            d="M70.5044 62.0439L59.2237 50.7632L90.2456 19.7412L141.009 70.5044L70.5044 141.009L59.2237 129.728L118.447 70.5044L109.987 62.0439L70.5044 101.526L59.2237 90.2456L98.7061 50.7632L90.2456 42.3026L70.5044 62.0439Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {/* Top corner ornaments — each rendered twice (coloured + outline). */}
      <div className={styles.ornament_top_left}>
        <Ornament className={styles.ornament_colored} />
        <Ornament className={styles.ornament} />
      </div>
      <div className={styles.ornament_top_right}>
        <Ornament className={styles.ornament_colored} />
        <Ornament className={styles.ornament} />
      </div>

      {/* Centre content: rotation icon + instruction text. */}
      <div className={styles.content}>
        <RotateIcon className={styles.icon} />
        <p className={styles.text}>
          For a better experience, please rotate your phone to landscape
        </p>
      </div>

      {/* Bottom corner ornaments. */}
      <div className={styles.ornament_bottom_left}>
        <Ornament className={styles.ornament_colored} />
        <Ornament className={styles.ornament} />
      </div>
      <div className={styles.ornament_bottom_right}>
        <Ornament className={styles.ornament_colored} />
        <Ornament className={styles.ornament} />
      </div>

      {/* Footer slot (kept empty for now — reserved for the lion logo). */}
      <div className={styles.footer}></div>
    </div>
  );
};

export default Portrait_Overlay;
