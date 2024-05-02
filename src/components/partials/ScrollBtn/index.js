import React from 'react';
import style from './index.module.scss';

const ScrollBtn = () => {
  return (
    <div className={style.scroll_btn_cont}>
      <div className={style.scroll_circle_left}></div>
      <div className={style.scroll_circle_right}></div>
      <div className={style.scroll_circle_dot}></div>
      <h6 className={style.scroll_down_sentence}>
        <div className={style.dot}></div>
      </h6>
    </div>
  );
};

export default ScrollBtn;
