import React from 'react';
import style from './index.module.scss';

const Sentence = () => {
  return (
    <h2 className={style.loader_title}>
      Imagine <div className={style.word_dot}></div>
      Create <div className={style.word_dot}></div>
      Inspire
    </h2>
  );
};

export default Sentence;
