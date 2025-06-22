import React, { useEffect, useState } from 'react';
import style from './index.module.scss';

const ColorPicker = () => {
  const [color, setColor] = useState('');

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', color);
  }, [color]);

  return (
    <div className={style.color_picker_cont}>
      <p className={style.btn_title}>
        <span>color</span>
        <span>color</span>
      </p>
      <input
        type="color"
        id="colorPicker"
        className={style.input_color_picker}
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
    </div>
  );
};

export default ColorPicker;
