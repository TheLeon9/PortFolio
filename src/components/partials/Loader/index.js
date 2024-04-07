import React, { useState, useEffect, useRef } from 'react';
import style from './index.module.scss';

import Image from 'next/image';
import { gsap } from 'gsap';

import LogoWhite from 'p/img/logo/logo_fm_white.svg';

const SectionPresentation = (props) => {
  const [percentage, setPercentage] = useState(0);
  const [endAnimation, setEndAnimation] = useState(false);
  const loaderContCenterRef = useRef(null);
  const cornerLeftRef = useRef(null);
  const cornerRightRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (percentage < 97) {
        setPercentage(
          (prevPercentage) => prevPercentage + Math.floor(Math.random() * 3) + 1
        );
      }
      if (percentage >= 97) {
        setPercentage(100);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [percentage]);

  useEffect(() => {
    if (percentage === 100) {
      setTimeout(() => {
        setEndAnimation(true);
      }, 400);
    }
  }, [percentage]);

  useEffect(() => {
    if (endAnimation) {
      gsap.to(loaderContCenterRef.current, {
        duration: 0.5,
        autoAlpha: 0,
        onComplete: animateCorners,
      });
    }
  }, [endAnimation]);

  const animateCorners = () => {
    setTimeout(() => {
      gsap.to(cornerLeftRef.current, { duration: 2, left: "-60%" });
      gsap.to(cornerRightRef.current, { duration: 2, right: "-60%" });
      setTimeout(() => {
        props.setLoader(false);
      }, 1200);
    }, 400);
  };

  return (
    <div className={style.loader_cont}>
      <div ref={cornerLeftRef} className={style.loader_corner_left}></div>
      <div ref={cornerRightRef} className={style.loader_corner_right}></div>
      <div ref={loaderContCenterRef} className={style.loader_cont_center}>
        <Image
          src={LogoWhite.src}
          alt="Logo FM White"
          width={120}
          height={120}
          className={style.loader_logo_white}
        />
        <div className={style.loader_text_cont}>
          <p className={style.loader_percentage}>{percentage}</p>
          <h2 className={style.loader_title}>
            Imagine <div className={style.word_dot}></div>
            Create <div className={style.word_dot}></div>
            Inspire
          </h2>
        </div>
      </div>
    </div>
  );
};

export default SectionPresentation;
