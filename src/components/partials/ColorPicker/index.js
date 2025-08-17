import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import style from './index.module.scss';

import LogoReset from 'p/img/custom_img/reset.svg';

import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_MAIN_COLOR,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TRANSMISSION_LEVEL,
  imgWH,
  COLOR_OPTIONS,
} from '@/constants';
import { useTheme } from '@/context/ThemeContext.js';

const ColorPicker = () => {
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

  const [activeFilter, setActiveFilter] = useState(null); // 'main' | 'background' | 'transparency' | null

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--color-primary', mainColor);
    root.setProperty('--color-background', backgroundColor);
    root.setProperty('--color-text', textColor);
  }, [mainColor, backgroundColor, textColor]);

  const handleReset = () => {
    setMainColor(DEFAULT_MAIN_COLOR);
    setBackgroundColor(DEFAULT_BACKGROUND_COLOR);
    setTextColor(DEFAULT_TEXT_COLOR);
    SetTransmissionLevel(DEFAULT_TRANSMISSION_LEVEL);
    setActiveFilter(null);
  };

  const toggleFilter = (filter) => {
    setActiveFilter((prev) => (prev === filter ? null : filter));
  };

  const renderColorButtons = (colors, setter) =>
    colors.map(({ name, color }) => (
      <button
        key={name}
        className={style.color_dot}
        style={{ backgroundColor: color }}
        title={name}
        onClick={() => setter(color)}
      />
    ));

  return (
    <div
      className={`${style.color_picker_cont} ${
        activeFilter != null ? style.open_options_menu : ''
      }`}
    >
      <div className={style.custom_btn}></div>

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
                min="0.1"
                max="1"
                step="0.01"
                value={TransmissionLevel}
                onChange={(e) =>
                  SetTransmissionLevel(parseFloat(e.target.value))
                }
              />
              <p>{Math.round(TransmissionLevel * 100)}%</p>
            </div>
          )}
        </div>
      </div>

      <div className={style.custom_selected_menu}>
        <div className={style.custom_selected_top}>
          <button
            style={{ backgroundColor: mainColor }}
            className={style.custom_button}
            title="Main Color"
            onClick={() => toggleFilter('main')}
          />
          <button
            style={{ backgroundColor: backgroundColor }}
            className={style.custom_button}
            title="Background Color"
            onClick={() => toggleFilter('background')}
          />
          <button
            className={`${style.custom_button} ${style.opacity_button}`}
            title="Transparency Level"
            onClick={() => toggleFilter('transparency')}
          />
        </div>

        <div className={style.custom_selected_bot}>
          <button onClick={handleReset} className={style.reset_color}>
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
