//=============================================================================
// ColorPicker — Customisation panel for primary, background and transparency
//
// Three filters: main colour, background colour, transparency slider. Only
// one filter is open at a time. The selected colours are persisted in the
// ThemeContext, which propagates them everywhere (CSS variables, shader
// uniforms, canvas textures — see Layout).
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React, { useEffect, useState } from 'react';

import Image from 'next/image';

// Theme context exposes the current values + setters.
import { useTheme } from '@/context/ThemeContext.js';

// Defaults + the predefined palettes shown in each filter.
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_MAIN_COLOR,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TRANSMISSION_LEVEL,
  imgWH,
  COLOR_OPTIONS,
} from '@/constants';

// Reset icon served from /public.
import LogoReset from 'p/img/custom_img/reset.svg';

// CSS module: panel layout, dot grid, slider, transitions.
import style from './index.module.scss';

/**
 * ColorPicker
 * Reads the theme values from context and renders the matching filter UI.
 */
const ColorPicker = () => {
  //-- State / Refs -----------------------------------------------------------

  // Pull every theme value + setter from the global ThemeContext.
  const {
    mainColor,
    setMainColor,
    backgroundColor,
    setBackgroundColor,
    textColor,
    setTextColor,
    TransmissionLevel,
    SetTransmissionLevel,
  } = useTheme();

  // Currently open filter: 'main' | 'background' | 'transparency' | null.
  const [activeFilter, setActiveFilter] = useState(null);

  //-- Effects ----------------------------------------------------------------

  // Push the latest theme colours into the CSS variables on the <html>
  // element so the rest of the React UI follows the picker live.
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--color-primary', mainColor);
    root.setProperty('--color-background', backgroundColor);
    root.setProperty('--color-text', textColor);
  }, [mainColor, backgroundColor, textColor]);

  //-- Handlers ---------------------------------------------------------------

  /**
   * handleReset
   * Restore every theme value to its default and close the active filter.
   */
  const handleReset = () => {
    setMainColor(DEFAULT_MAIN_COLOR);
    setBackgroundColor(DEFAULT_BACKGROUND_COLOR);
    setTextColor(DEFAULT_TEXT_COLOR);
    SetTransmissionLevel(DEFAULT_TRANSMISSION_LEVEL);
    setActiveFilter(null);
  };

  /**
   * toggleFilter
   * Open the requested filter; clicking the already-active filter closes it.
   */
  const toggleFilter = (filter) => {
    setActiveFilter((prev) => (prev === filter ? null : filter));
  };

  /**
   * renderColorButtons
   * Helper that turns a palette array into a list of clickable dots.
   */
  const renderColorButtons = (colors, setter) =>
    colors.map(({ name, color }) => (
      <button
        key={name}
        className={style.color_dot}
        // Inline backgroundColor lets us paint the dot in its own colour.
        style={{ backgroundColor: color }}
        title={name}
        aria-label={name}
        onClick={() => setter(color)}
      />
    ));

  //-- Render -----------------------------------------------------------------
  return (
    <div
      // The container gets an extra class when a filter is open — CSS uses
      // it to expand the panel.
      className={`${style.color_picker_cont} ${
        activeFilter != null ? style.open_options_menu : ''
      } hover_target_small`}
    >
      <div className={style.custom_btn}></div>

      {/* Options panel — shows whichever filter is currently active. */}
      <div className={style.custom_options_menu}>
        <div className={style.filter_section}>
          {activeFilter === 'main' && (
            <div className={style.color_buttons}>
              {renderColorButtons(COLOR_OPTIONS.main, setMainColor)}
            </div>
          )}
          {activeFilter === 'background' && (
            <div className={`${style.color_buttons} ${style.background_color}`}>
              {renderColorButtons(COLOR_OPTIONS.background, setBackgroundColor)}
            </div>
          )}
          {activeFilter === 'transparency' && (
            <div className={style.transparency_slider}>
              <input
                type="range"
                // Range matches the wobble material transmission constraints.
                min="0.1"
                max="1"
                step="0.01"
                value={TransmissionLevel}
                aria-label="Transparency"
                onChange={(e) =>
                  SetTransmissionLevel(parseFloat(e.target.value))
                }
              />
              {/* Show the value as a percentage for human readability. */}
              <p>{Math.round(TransmissionLevel * 100)}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Always-visible bar with the three filter toggles + the reset btn. */}
      <div className={style.custom_selected_menu}>
        <div className={style.custom_selected_top}>
          <button
            // Show the current main colour as the button background.
            style={{ backgroundColor: mainColor }}
            className={style.custom_button}
            title="Main Color"
            aria-label="Main color"
            onClick={() => toggleFilter('main')}
          />
          <button
            style={{ backgroundColor: backgroundColor }}
            className={style.custom_button}
            title="Background Color"
            aria-label="Background color"
            onClick={() => toggleFilter('background')}
          />
          <button
            // Transparency button has no inline style — pattern via CSS.
            className={`${style.custom_button} ${style.opacity_button}`}
            title="Transparency Level"
            aria-label="Transparency level"
            onClick={() => toggleFilter('transparency')}
          />
        </div>

        <div className={style.custom_selected_bot}>
          <button
            onClick={handleReset}
            className={style.reset_color}
            aria-label="Reset colors"
          >
            <Image src={LogoReset} alt="Reset" width={imgWH} height={imgWH} />
          </button>
          <p className={style.custom_title}>customize me</p>
          <div className={style.custom_space}></div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
