import React, { useState, useEffect } from 'react';
import style from './index.module.scss';
import { gsap } from 'gsap';

const SectionPresentation = (props) => {
  useEffect(() => {
    const spanArray = Array.from(
      document.querySelectorAll('.span_rotate_cont')
    );

    let indexDelay = 0;

    const animateLeftToRight = () => {
      spanArray.forEach((singleSpan, index) => {
        gsap.from(singleSpan, {
          delay: indexDelay,
          duration: 0.5,
          rotationY: 90,
          ease: 'power2.out',
          // onUpdate: changeLettersLeftToRight,
          onComplete: () => {
            if (index === spanArray.length - 1) {
              indexDelay = 0;
              spanArray.reverse();
              animateRightToLeft();
            }
          },
        });
        indexDelay += 0.1;
      });
    };

    const animateRightToLeft = () => {
      spanArray.forEach((singleSpan, index) => {
        gsap.from(singleSpan, {
          delay: indexDelay,
          duration: 0.5,
          rotationY: 90,
          ease: 'power2.out',
          // onUpdate: changeLettersLeftToRight,
          onComplete: () => {
            if (index === spanArray.length - 1) {
              indexDelay = 0;
              spanArray.reverse();
              animateLeftToRight();
            }
          },
        });
        indexDelay += 0.1;
      });
    };

    // const changeLettersLeftToRight = () => {
    //   const lettersToChange = [
    //     { selector: '.span_rotate_cont:nth-child(3) span', letter: 'V' },
    //     { selector: '.span_rotate_cont:nth-child(4) span', letter: 'E' },
    //     { selector: '.span_rotate_cont:nth-child(5) span', letter: 'L' },
    //     { selector: '.span_rotate_cont:nth-child(6) span', letter: 'O' },
    //     { selector: '.span_rotate_cont:nth-child(7) span', letter: 'P' },
    //     { selector: '.span_rotate_cont:nth-child(8) span', letter: 'E' },
    //     { selector: '.span_rotate_cont:nth-child(9) span', letter: 'R' },
    //   ];

    //   lettersToChange.forEach(({ selector, letter }) => {
    //     gsap.to(selector, { duration: 0.5, textContent: letter, delay: 0.1 });
    //   });
    // };

    animateLeftToRight();
  }, []);

  return (
    <section className={style.section_presentation_cont}>
      <h1 className={style.presentation_title}>
        {props.presentationTitle}&nbsp;
        <span className={style.presentation_title_colored}>
          {props.presentationTitleColored}
        </span>
      </h1>
      <div className={style.span_text_cont}>
        {props.presentationText === 'Home' ? (
          <>
            Creative&nbsp;Web&nbsp;
            <div className={`span_rotate_cont ${style.span_rotate_cont}`}>
              <span>D</span>
            </div>
            <div className={`span_rotate_cont ${style.span_rotate_cont}`}>
              <span>e</span>
            </div>
            <div className={`span_rotate_cont ${style.span_rotate_cont}`}>
              <span>v</span>
            </div>
            <div className={`span_rotate_cont ${style.span_rotate_cont}`}>
              <span>e</span>
            </div>
            <div className={`span_rotate_cont ${style.span_rotate_cont}`}>
              <span>l</span>
            </div>
            <div className={`span_rotate_cont ${style.span_rotate_cont}`}>
              <span>o</span>
            </div>
            <div className={`span_rotate_cont ${style.span_rotate_cont}`}>
              <span>p</span>
            </div>
            <div className={`span_rotate_cont ${style.span_rotate_cont}`}>
              <span>e</span>
            </div>
            <div className={`span_rotate_cont ${style.span_rotate_cont}`}>
              <span>r</span>
            </div>
          </>
        ) : (
          <span>{text}</span>
        )}
      </div>
    </section>
  );
};

export default SectionPresentation;
