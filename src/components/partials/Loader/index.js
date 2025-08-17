import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import style from './index.module.scss';

import * as THREE from 'three';
import { gsap } from 'gsap';

import LogoWhiteAnimated from 'p/img/loading/logo_fm_white_animated.svg';
import BlueCircle from 'p/img/loading/blue_ornament_circle.svg';

import Sentence from '@/components/UI/Sentence';
import MusicButton from '@/components/UI/MusicButton';

const SectionPresentation = ({ wobbleRef, wobblePlateRef, setLoader }) => {
  const [percentage, setPercentage] = useState(0);
  const [endAnimation, setEndAnimation] = useState(false);

  const loaderContCenterRef = useRef(null);
  const loaderContMusicRef = useRef(null);
  const cornerLeftRef = useRef(null);
  const cornerRightRef = useRef(null);

  // Loading percentage
  useEffect(() => {
    const interval = setInterval(() => {
      setPercentage((prev) =>
        prev < 97 ? prev + Math.floor(Math.random() * 3) + 1 : prev
      );
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Forcing 100%
  useEffect(() => {
    if (percentage >= 97 && percentage < 100) {
      setPercentage(100);
    }
  }, [percentage]);

  // End of loading => trigger fade out
  useEffect(() => {
    if (percentage === 100) {
      const timeout = setTimeout(() => {
        setEndAnimation(true);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [percentage]);

  // Animation corners (memoized)
  const animateCorners = useCallback(() => {
    setTimeout(() => {
      gsap.to(cornerLeftRef.current, { duration: 2, left: '-60%' });
      gsap.to(cornerRightRef.current, { duration: 2, right: '-60%' });

      gsap.to(wobbleRef.current.position, {
        z: 0,
        duration: 2,
        ease: 'power1.inOut',
      });

      gsap.to(wobblePlateRef.current.rotation, {
        x: THREE.MathUtils.degToRad(90),
        duration: 2,
        ease: 'power1.inOut',
      });

      setTimeout(() => {
        setLoader(false);
      }, 1200);
    }, 400);
  }, [wobbleRef, wobblePlateRef, setLoader]);

  // Fade out loader elements
  useEffect(() => {
    if (endAnimation) {
      gsap.to([loaderContCenterRef.current, loaderContMusicRef.current], {
        duration: 0.5,
        autoAlpha: 0,
        onComplete: animateCorners,
      });
    }
  }, [endAnimation, animateCorners]);

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

      <div ref={loaderContMusicRef} className={style.music_wrapper}>
        <div className={style.music_selector_cont}>
          <MusicButton />
        </div>
        <p className={style.text_music}>
          We use ambient sound to make your experience more immersive.
        </p>
      </div>
    </div>
  );
};

export default SectionPresentation;
