import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import style from './index.module.scss';

const Sentence = () => {
  useEffect(() => {
    const animateText = () => {
      const words = document.querySelectorAll('.word');

      gsap.fromTo(
        words,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          stagger: 0.1,
          duration: 0.6,
          ease: 'power2.out',
        }
      );
    };

    animateText();
  }, []);

  return (
    <div className={style.sentence_cont}>
      <h2 className={style.sentence}>
        <span className={`word ${style.word}`}>I</span>
        <span className={`word ${style.word}`}>m</span>
        <span className={`word ${style.word}`}>a</span>
        <span className={`word ${style.word}`}>g</span>
        <span className={`word ${style.word}`}>i</span>
        <span className={`word ${style.word}`}>n</span>
        <span className={`word ${style.word}`}>e</span>
        &nbsp;
        <span className={`word ${style.word}`}>·</span>
        &nbsp;
        <span className={`word ${style.word}`}>C</span>
        <span className={`word ${style.word}`}>r</span>
        <span className={`word ${style.word}`}>e</span>
        <span className={`word ${style.word}`}>a</span>
        <span className={`word ${style.word}`}>t</span>
        <span className={`word ${style.word}`}>e</span>
        &nbsp;
        <span className={`word ${style.word}`}>·</span>
        &nbsp;
        <span className={`word ${style.word}`}>I</span>
        <span className={`word ${style.word}`}>n</span>
        <span className={`word ${style.word}`}>s</span>
        <span className={`word ${style.word}`}>p</span>
        <span className={`word ${style.word}`}>i</span>
        <span className={`word ${style.word}`}>r</span>
        <span className={`word ${style.word}`}>e</span>
      </h2>
    </div>
  );
};

export default Sentence;
