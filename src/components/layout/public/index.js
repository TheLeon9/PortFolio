import React, { useState, useEffect, useRef } from 'react';
import style from './index.module.scss';
import gsap from 'gsap';

// Components
import NavBar from '@/components/partials/NavBar';
import ScrollBtn from '@/components/partials/ScrollBtn';
import ShareBtn from '@/components/partials/ShareBtn';
import Loader from '@/components/partials/Loader';
import ColorPicker from '@/components/partials/ColorPicker';
import MusicSelector from '@/components/partials/MusicSelector';
import ScrollProgress from '@/components/partials/ScrollProgress';
import ChatBot from '@/components/partials/ChatBot';
import Cursor from '@/components/UI/Cursor';

// import SideSlider from '@/components/partials/SideSlider';

import { sections } from '@/constants';
import { useTheme } from '@/context/ThemeContext.js';
import { initThreeScene } from '@/utils/initThreeScene';

const Layout = ({ children }) => {
  //  Customisation Features
  const { mainColor, backgroundColor, TransmissionLevel } = useTheme();

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
      TransmissionLevel,
    });
  }, []);

  useEffect(() => {
    if (customColor.current) {
      customColor.current.uMainColor.value.set(mainColor);
      customColor.current.uSecondColor.value.set(backgroundColor);
    }
    if (wobbleRef.current) {
      wobbleRef.current.material.transmission = TransmissionLevel;
    }
  }, [mainColor, backgroundColor, TransmissionLevel]);

  useEffect(() => {
    // Update localStorage and notify other components when activeSection changes
    localStorage.setItem('activeSection', activeSection);
    window.dispatchEvent(new Event('storageChange'));
  }, [activeSection]);

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
    if (event.target.closest?.(`.${style.messages}`)) {
      return; // On bloque le scroll global
    }

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

      {/* Custom Cursor */}
      <Cursor />

      {/* Loader */}
      {isLoading ? (
        <Loader
          setLoader={setLoader}
          wobbleRef={wobbleRef}
          wobblePlateRef={wobblePlateRef}
        />
      ) : (
        <>
          {/* Navigation Bar */}
          <NavBar activeSection={activeSection} changeSection={changeSection} />

          {/* Button Home */}
          <div className={style.home_btn_cont}>
            <button
              onClick={() => changeSection(0)}
              className={`${style.home_btn} hover_target_big`}
            >
              <svg
                role="img"
                aria-label="Logo FM Black"
                width="144"
                height="144"
                viewBox="0 0 144 144"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={style.home_logo}
              >
                <path
                  d="M73.4956 2.99123L2.99121 73.4956L53.7544 124.259L65.0351 112.978L45.2938 93.2368L65.0351 73.4956L53.7544 62.2149L34.0131 81.9561L25.5526 73.4956L84.7763 14.2719L73.4956 2.99123Z"
                  fill="#0132b5"
                  className="svg_color"
                />
                <path
                  d="M73.4956 65.0351L62.2149 53.7544L93.2368 22.7325L144 73.4956L73.4956 144L62.2149 132.719L121.439 73.4956L112.978 65.0351L73.4956 104.518L62.2149 93.2368L101.697 53.7544L93.2368 45.2939L73.4956 65.0351Z"
                  fill="#0132b5"
                  className="svg_color"
                />
                <path
                  d="M70.5044 1.46416e-05L0 70.5044L50.7632 121.268L62.0439 109.987L42.3026 90.2456L62.0439 70.5044L50.7632 59.2237L31.0219 78.9649L22.5614 70.5044L81.7851 11.2807L70.5044 1.46416e-05Z"
                  fill="#040B12"
                />
                <path
                  d="M70.5044 62.0439L59.2237 50.7632L90.2456 19.7412L141.009 70.5044L70.5044 141.009L59.2237 129.728L118.447 70.5044L109.987 62.0439L70.5044 101.526L59.2237 90.2456L98.7061 50.7632L90.2456 42.3026L70.5044 62.0439Z"
                  fill="#040B12"
                />
              </svg>
            </button>
          </div>

          {/* Btn Share container */}
          <ShareBtn />

          {/* Scroll Progress Percentage */}
          <ScrollProgress />

          {/* ChatBot container */}
          <ChatBot />

          {/* ColorPicker container */}
          <ColorPicker />

          {/* Scroll Btn container */}
          <ScrollBtn />

          {/* Music Selector container */}
          <MusicSelector />

          {/* Side Slider container */}
          {/* <SideSlider /> */}

          {/* {children} */}
          {React.cloneElement(children, { activeSection })}
        </>
      )}
    </div>
  );
};

export default Layout;
