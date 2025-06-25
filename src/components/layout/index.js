import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import style from './index.module.scss';

import * as THREE from 'three';
import gsap from 'gsap';
import GUI from 'lil-gui';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

// Shaders
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import wobbleVertexShader from './shaders/wobble/vertex.glsl';
import wobbleFragmentShader from './shaders/wobble/fragment.glsl';

// Render
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// Components
import NavBar from '@/components/partials/NavBar';
import ScrollBtn from '@/components/partials/ScrollBtn';
import ShareBtn from '@/components/partials/ShareBtn';
import Loader from '@/components/partials/Loader';
import ColorPicker from '@/components/partials/ColorPicker';

import { sections } from '@/constants';
import { useTheme } from '@/context/ThemeContext.js';
import { initThreeScene } from '@/utils/initThreeScene';

import Logo from 'p/img/logo/logo_fm_black.svg';

const Layout = ({ children }) => {
  //  Customisation Features
  const { mainColor, backgroundColor, TransparencyLevel } = useTheme();

  // Loader
  const [isLoading, setLoader] = useState(true);

  //  Active Session
  const [activeSection, setActiveSection] = useState('0');

  // 3D ref
  const wobbleRef = useRef();
  const wobblePlateRef = useRef();
  const customColor = useRef();

  useEffect(() => {
    initThreeScene({
      canvasId: 'webgl',
      mainColor,
      backgroundColor,
      wobbleRef,
      wobblePlateRef,
      customColor,
    });
  }, []);

  useEffect(() => {
    if (customColor.current) {
      customColor.current.uMainColor.value.set(mainColor);
      customColor.current.uSecondColor.value.set(backgroundColor);
    }
  }, [mainColor, backgroundColor]);

  // //--------------------------------------------------+
  // //
  // //  Set the localstorage for the active Section
  // //
  // //--------------------------------------------------+

  // useEffect(() => {
  //   // Get the active section from localStorage
  //   const storedActiveSection = localStorage.getItem('activeSection');
  //   setActiveSection(storedActiveSection || '0');

  //   // If we change the active section we update it
  //   const handleStorageChange = () => {
  //     const updatedActiveSection = localStorage.getItem('activeSection');
  //     setActiveSection(updatedActiveSection || '0');
  //   };

  //   window.addEventListener('storageChange', handleStorageChange);

  //   return () => {
  //     window.removeEventListener('storageChange', handleStorageChange);
  //   };
  // }, []);

  useEffect(() => {
    // Update localStorage and notify other components when activeSection changes
    localStorage.setItem('activeSection', activeSection);
    window.dispatchEvent(new Event('storageChange'));
  }, [activeSection]);

  // useEffect(() => {
  //   console.log(activeSection);
  //   console.log(typeof(activeSection));
  // }, [activeSection]);

  //--------------------------------------------------+
  //
  //  Change the active section on scroll
  //
  //--------------------------------------------------+

  // Change de section if we can
  const changeSection = (index) => {
    if (index >= 0 && index < sections.length && index != activeSection) {
      const sectionElement = document.querySelector('.global_page_container');
      if (sectionElement) {
        gsap.to(sectionElement, {
          x: -50,
          opacity: 0,
          duration: 0.6,
          onComplete: () => {
            setActiveSection(index.toString());
            // Reset animation properties for the next activation
            gsap.set(sectionElement, { x: 0, opacity: 1, delay: 0.2 });
          },
        });
      } else {
        setActiveSection(index.toString());
      }
    }
  };

  // Simulated scroll event
  const handleScroll = (event) => {
    const { deltaY } = event;
    const currentIndex = parseInt(activeSection, 10);

    if (deltaY > 0) {
      // Scroll down
      changeSection(currentIndex + 1);
    } else if (deltaY < 0) {
      // Scroll up
      changeSection(currentIndex - 1);
    }
  };

  useEffect(() => {
    // Add event listener for simulated scroll
    window.addEventListener('wheel', handleScroll);

    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener('wheel', handleScroll);
    };
  }, [activeSection]);

  return (
    <div className={style.global_cont}>
      {/* Page Content */}

      {/* 3D Container */}
      <canvas className={style.webgl} id="webgl"></canvas>

      {/* Loader */}
      {isLoading ? (
        <Loader
          setLoader={setLoader}
          wobbleRef={wobbleRef}
          wobblePlateRef={wobblePlateRef}
        />
      ) : (
        <>
          {/* Wall */}
          {/* <div
            className={style.wall}
            style={{
              opacity: wallOpacity,
              transform: `translateX(${wallPosition}px)`,
            }}
          ></div> */}

          {/* Navigation Bar */}
          <NavBar activeSection={activeSection} changeSection={changeSection} />

          {/* Btn Share container */}
          <ShareBtn />

          {/* Button Home */}
          <div className={style.home_btn_cont}>
            <button onClick={() => changeSection(0)} className={style.home_btn}>
              <Image
                src={Logo.src}
                alt="Logo FM Black"
                width={40}
                height={40}
                className={style.home_logo}
              />
            </button>
          </div>

          {/* ColorPicker container */}
          <ColorPicker />

          {/* Scroll Btn container */}
          <ScrollBtn />

          {/* {children} */}
          {React.cloneElement(children, { activeSection })}
        </>
      )}
    </div>
  );
};

export default Layout;
