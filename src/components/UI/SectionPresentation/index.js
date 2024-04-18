import React, { useState, useEffect } from 'react';
import style from './index.module.scss';
import { gsap } from 'gsap';

const SectionPresentation = (props) => {
  const [isDev, setIsDev] = useState(true);

  useEffect(() => {
    const spanArray = Array.from(document.querySelectorAll('.span_rotate'));

    let indexDelay = 1;
    const indexDelayAdd = 0.1;
    const animDuration = 0.5;

    const animate = () => {
      spanArray.forEach((singleSpan, index) => {
        gsap.from(singleSpan, {
          delay: indexDelay,
          duration: animDuration,
          rotationY: 360,
          ease: 'power2.out',
          onUpdate: changeLetters(index + 1),
          onComplete: () => {
            if (index === spanArray.length - 1) {
              indexDelay = 0;
              console.log('là aussi');
              setIsDev(!isDev);
              setTimeout(animate, 2000);
            }
          },
        });
        indexDelay += indexDelayAdd;
      });
    };

    const changeLetters = (index) => {
      if (index > 2) {
        let lettersToChange = [];
        if (isDev) {
          lettersToChange = [
            { selector: '.span_rotate:nth-child(3)', letter: 'v' },
            { selector: '.span_rotate:nth-child(4)', letter: 'e' },
            { selector: '.span_rotate:nth-child(5)', letter: 'l' },
            { selector: '.span_rotate:nth-child(6)', letter: 'o' },
            { selector: '.span_rotate:nth-child(7)', letter: 'p' },
            { selector: '.span_rotate:nth-child(8)', letter: 'e' },
            { selector: '.span_rotate:nth-child(9)', letter: 'r' },
          ];
        } else if (!isDev) {
          lettersToChange = [
            { selector: '.span_rotate_cont:nth-child(3)', letter: 's' },
            { selector: '.span_rotate_cont:nth-child(4)', letter: 'i' },
            { selector: '.span_rotate_cont:nth-child(5)', letter: 'g' },
            { selector: '.span_rotate_cont:nth-child(6)', letter: 'n' },
            { selector: '.span_rotate_cont:nth-child(7)', letter: 'e' },
            { selector: '.span_rotate_cont:nth-child(8)', letter: 'r' },
            { selector: '.span_rotate_cont:nth-child(9)', letter: '' },
          ];
        }
        lettersToChange.forEach(({ selector, letter }) => {
          gsap.to(selector, { duration: 0.5, textContent: letter, delay: 0.1 });
        });
      }
    };

    animate();
  });

  // useEffect(() => {
  //   // animate();
  //   setLaunchAnim(!launchAnim);
  //   // setTimeout(animate, 2000);
  // }, [isDev]);

  return (
    <section className={style.section_presentation_cont}>
      <h1 className={style.presentation_title}>
        {props.presentationTitle}&nbsp;
        <span className={style.presentation_title_colored}>
          {props.presentationTitleColored}
        </span>
      </h1>
      <p className={style.span_text_cont}>
        {props.presentationText === 'Home' ? (
          <>
            Creative&nbsp;Web&nbsp;
            <span className={`span_rotate`}>D</span>
            <span className={`span_rotate`}>e</span>
            <span className={`span_rotate`}>v</span>
            <span className={`span_rotate`}>e</span>
            <span className={`span_rotate`}>l</span>
            <span className={`span_rotate`}>o</span>
            <span className={`span_rotate`}>p</span>
            <span className={`span_rotate`}>e</span>
            <span className={`span_rotate`}>r</span>
          </>
        ) : (
          <span>{text}</span>
        )}
      </p>
    </section>
  );
};

export default SectionPresentation;
