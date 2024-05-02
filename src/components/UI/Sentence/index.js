import React, { useEffect, useState } from 'react';
import style from './index.module.scss';

const Sentence = (props) => {
  const [color, setColor] = useState(true);

  useEffect(() => {
    if (props.white == 'true') {
      setColor(true);
    } else setColor(false);
  }, [props.white]);

  return (
    <h2
      className={
        color
          ? `${style.loader_title_white} ${style.loader_title}`
          : `${style.loader_title_black} ${style.loader_title}`
      }
    >
      Imagine <div className={style.word_dot}></div>
      Create <div className={style.word_dot}></div>
      Inspire
    </h2>
  );
};

export default Sentence;
