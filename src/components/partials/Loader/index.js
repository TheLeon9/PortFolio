import React, { useState, useEffect, useRef } from 'react';
import style from './index.module.scss';
import Sentence from '@/components/UI/Sentence';

import * as THREE from 'three';
import Image from 'next/image';
import { gsap } from 'gsap';

import LogoWhiteAnimated from 'p/img/loading/logo_fm_white_animated.svg';
import BlueCircle from 'p/img/loading/blue_ornament_circle.svg';

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
    }, 40);
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
      // We open the "wall"
      gsap.to(cornerLeftRef.current, { duration: 2, left: '-60%' });
      gsap.to(cornerRightRef.current, { duration: 2, right: '-60%' });

      // We change the position of the wobble sphere to animate it during the opening
      gsap.to(props.wobbleRef.current.position, {
        z: 0,
        duration: 2,
        ease: 'power1.inOut',
      });

      gsap.to(props.wobblePlateRef.current.rotation, {
        x: THREE.MathUtils.degToRad(90),
        duration: 2,
        ease: 'power1.inOut',
      });

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
          src={BlueCircle.src}
          alt="BlueCircle"
          width={120}
          height={120}
          className={style.blue_circle}
        />
        <Image
          src={LogoWhiteAnimated.src}
          alt="Logo FM White"
          width={120}
          height={120}
          className={style.loader_logo_white}
        />
        <div className={style.loader_text_cont}>
          <p className={style.loader_percentage}>{percentage}</p>
          <Sentence white="true" />
        </div>
      </div>
    </div>
  );
};

export default SectionPresentation;
