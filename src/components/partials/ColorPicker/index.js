import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import style from './index.module.scss';

import LogoReset from 'p/img/custom_img/reset.svg';
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_MAIN_COLOR,
  DEFAULT_TEXT_COLOR,
  imgWH,
} from '@/constants';

const ColorPicker = () => {
  const [mainColorFilter, setMainColorFilter] = useState(false);
  const [backgroundColorFilter, setBackgroundColorFilter] = useState(false);
  const [transparencyLevelFilter, setTransparencyLevelFilter] = useState(false);

  const [mainColor, setMainColor] = useState(DEFAULT_MAIN_COLOR);
  const [backgroundColor, setBackgroundColor] = useState(
    DEFAULT_BACKGROUND_COLOR
  );
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', mainColor);
    document.documentElement.style.setProperty(
      '--color-background',
      backgroundColor
    );
    document.documentElement.style.setProperty('--color-text', textColor);
  }, [mainColor, backgroundColor, textColor]);

  const resetColor = () => {
    setMainColor(DEFAULT_MAIN_COLOR);
    setBackgroundColor(DEFAULT_BACKGROUND_COLOR);
    setTextColor(DEFAULT_TEXT_COLOR);
  };

  const openMainColorFilter = () => {
    setMainColorFilter(!mainColorFilter);
    setBackgroundColorFilter(false);
    setTransparencyLevelFilter(false);
  };

  const openBackGroundFilter = () => {
    setMainColorFilter(false);
    setBackgroundColorFilter(!backgroundColorFilter);
    setTransparencyLevelFilter(false);
  };

  const openTransparencyLevelFilter = () => {
    setMainColorFilter(false);
    setBackgroundColorFilter(false);
    setTransparencyLevelFilter(!transparencyLevelFilter);
  };

  return (
    <div className={style.color_picker_cont}>
      <div className={style.custom_btn}></div>
      <div className={style.custom_options_menu}>
        {mainColorFilter && (
          <div className={style.filter_section}>
            <div className={style.color_buttons}>
              {[
                '#ff0000',
                '#00ff00',
                '#0000ff',
                '#ff00ff',
                '#00ffff',
                '#ffff00',
              ].map((color) => (
                <button
                  key={color}
                  className={style.color_dot}
                  style={{ backgroundColor: color }}
                  onClick={() => setMainColor(color)}
                />
              ))}
            </div>
          </div>
        )}

        {backgroundColorFilter && <></>}

        {transparencyLevelFilter && <></>}
      </div>
      <div className={style.custom_selected_menu}>
        <div className={style.custom_selected_top}>
          <button
            style={{ backgroundColor: mainColor }}
            className={style.custom_button}
            title="Main Color"
            onClick={openMainColorFilter}
          ></button>
          <button
            style={{ backgroundColor: backgroundColor }}
            className={style.custom_button}
            title="Background Color"
            onClick={openBackGroundFilter}
          ></button>
          <button
            className={`${style.custom_button} ${style.opacity_button}`}
            title="Transparency Level"
            onClick={openTransparencyLevelFilter}
          ></button>
        </div>
        <div className={style.custom_selected_bot}>
          <button onClick={resetColor} className={style.reset_color}>
            <Image
              src={LogoReset}
              alt="Logo Reset Color"
              width={imgWH}
              height={imgWH}
            />
          </button>

          <p className={style.custom_title}>CUSTOMIZE ME</p>
          <div className={style.custom_space}></div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
