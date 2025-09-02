import React, { useState, useEffect, useRef } from 'react';
import style from './index.module.scss';
import * as THREE from 'three';

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

import { useTheme } from '@/context/ThemeContext.js';
import { initThreeScene } from '@/utils/initThreeScene';
import { sections } from '@/constants';

const Layout = ({ children }) => {
  //  Customisation Features
  const {
    mainColor,
    backgroundColor,
    TransmissionLevel,
    scrollProgress,
    setScrollProgress,
    activeSection,
    setActiveSection,
    getSectionProgress,
  } = useTheme();

  // Loader
  const [isLoading, setLoader] = useState(true);

  // 3D ref
  const wobbleRef = useRef();
  const wobblePlateRef = useRef();
  const customColor = useRef();
  const TextRef = useRef();
  const cameraRef = useRef();

  //--------------------------------------------------+
  //
  //  3D Parts
  //
  //--------------------------------------------------+

  // Init Three JS Scene
  useEffect(() => {
    initThreeScene({
      canvasId: 'webgl',
      mainColor,
      backgroundColor,
      wobbleRef,
      wobblePlateRef,
      customColor,
      TransmissionLevel,
      TextRef,
      cameraRef,
    });
  }, []);

  // Update Colors
  useEffect(() => {
    // Update shader uniforms
    customColor.current?.uMainColor.value.set(mainColor);
    customColor.current?.uSecondColor.value.set(backgroundColor);

    // Update wobble transmission
    wobbleRef.current?.material &&
      (wobbleRef.current.material.transmission = TransmissionLevel);

    // Update text colors
    TextRef.current?.traverse((child) => {
      if (child.isMesh && Array.isArray(child.material)) {
        // letters Front and Back
        child.material[0].color.set(backgroundColor);
        // letter side
        child.material[1].color.set(mainColor);
      }
    });
  }, [mainColor, backgroundColor, TransmissionLevel]);

  // Animate Home Section (Section 1)
  useEffect(() => {
    const group = TextRef.current;
    if (!group) return;

    const homeProgress = getSectionProgress(scrollProgress, sections[0].range); // 0..1

    const welcome = group.getObjectByName('welcome');
    const toMy = group.getObjectByName('to-my');
    const digital = group.getObjectByName('digital');
    const portfolio = group.getObjectByName('portfolio');

    if (!welcome || !toMy || !digital || !portfolio) return;

    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp01 = (v) => Math.max(0, Math.min(1, v));

    // ---- Configuration positions ----
    const center = { x: 0, y: 0, z: -4, ry: 0 }; // Center of the scene
    const farAway = { x: 100, y: 0, z: -100, ry: 0 }; // Far away for reset
    const offBottom = { x: 0, y: -20, z: -4, ry: 0 }; // Final exit for last text
    const startZ = 20; // Start further away on Z-axis for side texts

    const init = {
      welcome: { x: 0, y: 0, z: -4, ry: 0 },
      'to-my': { x: 20, y: -8, z: startZ, ry: -Math.PI / 2 },
      digital: { x: 20, y: -12, z: startZ, ry: -Math.PI / 2 },
      portfolio: { x: 20, y: -16, z: startZ, ry: -Math.PI / 2 },
    };

    // Interpolation function between outgoing and incoming text
    const transition = (outMesh, inMesh, p) => {
      const pauseFactor = 0.2; // fraction of the segment to pause at center
      const t = clamp01((p - pauseFactor) / (1 - pauseFactor)); // delayed interpolation

      if (outMesh) {
        outMesh.position.x = lerp(center.x, -15, t);
        outMesh.position.y = lerp(center.y, 10, t);
        outMesh.position.z = lerp(center.z, -10, t);
        outMesh.rotation.y = lerp(center.ry, Math.PI / 2, t);
      }

      if (inMesh) {
        inMesh.position.x = lerp(init[inMesh.name].x, center.x, t);
        inMesh.position.y = lerp(init[inMesh.name].y, center.y, t);
        inMesh.position.z = lerp(init[inMesh.name].z, center.z, t);
        inMesh.rotation.y = lerp(init[inMesh.name].ry, center.ry, t);
      }
    };

    const step = 1 / 4;
    const segIndex = Math.floor(homeProgress / step); // 0,1,2,3
    const segProgress = clamp01((homeProgress - segIndex * step) / step);

    // Reset all texts far away
    [welcome, toMy, digital, portfolio].forEach((m) => {
      m.position.set(farAway.x, farAway.y, farAway.z);
    });

    // Sequence transitions with pause at center
    if (segIndex === 0) transition(welcome, toMy, segProgress);
    else if (segIndex === 1) transition(toMy, digital, segProgress);
    else if (segIndex === 2) transition(digital, portfolio, segProgress);
    else if (segIndex >= 3) {
      // last text exits downward
      const exitProgress = clamp01((homeProgress - 3 * step) / step);
      portfolio.position.x = lerp(center.x, offBottom.x, exitProgress);
      portfolio.position.y = lerp(center.y, offBottom.y, exitProgress);
      portfolio.position.z = lerp(center.z, offBottom.z, exitProgress);
      portfolio.rotation.y = lerp(center.ry, offBottom.ry, exitProgress);
    }
  }, [scrollProgress]);

  useEffect(() => {
    const sphere = wobbleRef.current;
    const plane = wobblePlateRef.current;
    const camera = cameraRef.current;
    const uniforms = customColor.current;

    if (!sphere || !plane || !camera || !uniforms) return;

    const progress = getSectionProgress(scrollProgress, sections[4].range); // 0..1
    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const t = clamp01(progress);

    // Animate Sphere
    sphere.position.y = lerp(0.6, 12, t);

    // Animate Plane (Mur)
    plane.position.y = lerp(-4, 0, t);
    plane.position.z = lerp(1, 0, t);
    plane.rotation.x = lerp(
      THREE.MathUtils.degToRad(90),
      THREE.MathUtils.degToRad(180),
      t
    );

    // Animate Camera Zoom
    camera.position.z = lerp(0, -2, t);

    // Animate Shader Uniforms
    if (uniforms.uWarpStrength) {
      uniforms.uWarpStrength.value = lerp(1.8, 0.4, t);
    }

    if (uniforms.uPositionFrequency) {
      uniforms.uPositionFrequency.value = lerp(0.5, 0.2, t);
    }
  }, [scrollProgress]);

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
          <NavBar />

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
