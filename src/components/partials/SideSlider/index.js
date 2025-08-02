import React from 'react';

import style from './index.module.scss';

const SideSlider = () => {
  return (
    <div className={style.slider_cont}>
      <div className={style.slider_content}>
        {/* Projet effectuer */}
      </div>
      <div className={style.slider_tab_in}></div>
      <div className={style.slider_tab_out}>
        <p className={style.custom_title}>info</p>
      </div>
    </div>
  );
};

export default SideSlider;
