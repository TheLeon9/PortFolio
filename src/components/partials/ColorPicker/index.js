import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import style from './index.module.scss';

import LogoReset from 'p/img/share_img/share_logo.svg';
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_MAIN_COLOR,
  DEFAULT_TEXT_COLOR,
  imgWH,
} from '@/constants';

const ColorPicker = () => {
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

  return (
    <div className={style.color_picker_cont}>
      <div className={style.custom_btn}></div>
      <div className={style.custom_options_menu}></div>
      <div className={style.custom_selected_menu}>
        <div className={style.custom_selected_top}></div>
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
