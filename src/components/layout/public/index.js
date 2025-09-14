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
import { initThreeScene, updateProjectBandsColor} from '@/utils/initThreeScene';
import { sections } from '@/constants';
import { useConstants } from '@/context/ConstantsContext';

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

  // ref
  const wobbleRef = useRef();
  const wobblePlateRef = useRef();
  const customUniforms = useRef();
  const textRef = useRef();
  const cameraRef = useRef();
  const glassRef = useRef();
  const projectsRef = useRef();
  const skillsRef = useRef();
  const { skills, projects } = useConstants();
  const cursorRef = useRef(null);

  //--------------------------------------------------+
  //
  //  Init Three JS Scene
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
      customUniforms,
      TransmissionLevel,
      textRef,
      cameraRef,
      glassRef,
      skills,
      skillsRef,
      projects,
      projectsRef,
      cursorRef,
    });
  }, []);

  //--------------------------------------------------+
  //
  //  Update Colors
  //
  //--------------------------------------------------+
  useEffect(() => {
    // Update shader uniforms
    customUniforms.current?.uMainColor.value.set(mainColor);
    customUniforms.current?.uSecondColor.value.set(backgroundColor);

    // Update wobble transmission
    wobbleRef.current?.material &&
      (wobbleRef.current.material.transmission = TransmissionLevel);

    // Update text colors
    textRef.current?.traverse((child) => {
      if (child.isMesh && Array.isArray(child.material)) {
        // letters Front and Back
        child.material[0].color.set(backgroundColor);
        // letter side
        child.material[1].color.set(mainColor);
      }
    });

    // Update project ring textures & materials
    updateProjectBandsColor(mainColor, backgroundColor);

    skillsRef.current?.traverse((obj) => {
      if (obj.isMesh && obj.material?.emissive) {
        obj.material.color.set(mainColor);
        obj.material.emissive.set(mainColor);
      }
    });
  }, [mainColor, backgroundColor, TransmissionLevel]);

  //--------------------------------------------------+
  //
  // Animations Section by Section
  //
  //--------------------------------------------------+

  useEffect(() => {
    const camera = cameraRef.current;
    const wobble = wobbleRef.current;
    const plane = wobblePlateRef.current;
    const group = textRef.current;
    const uniforms = customUniforms.current;
    const projects = projectsRef.current;
    const skills = skillsRef.current;

    if (
      !camera ||
      !wobble ||
      !plane ||
      !group ||
      !uniforms ||
      !projects ||
      !skills
    )
      return;

    // Section Progresses
    const homeT = getSectionProgress(scrollProgress, sections[0].range);
    const aboutT = getSectionProgress(scrollProgress, sections[1].range);
    const projectsT = getSectionProgress(scrollProgress, sections[2].range);
    const skillsT = getSectionProgress(scrollProgress, sections[3].range);
    const contactT = getSectionProgress(scrollProgress, sections[4].range);

    // Utils
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp01 = (v) => Math.max(0, Math.min(1, v));

    const easeInOut = (x) => x * x * (3 - 2 * x); // smooth easing
    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3); // easing “rapide puis lent”
    const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    // ------------------------
    // Section 1: Home
    // ------------------------
    if (homeT > 0) {
      const welcome = group.getObjectByName('welcome');
      const toMy = group.getObjectByName('to-my');
      const digital = group.getObjectByName('digital');
      const portfolio = group.getObjectByName('portfolio');

      if (!welcome || !toMy || !digital || !portfolio) return;

      // Positions
      const center = { x: 0, y: 0, z: -4, ry: 0 }; // Center position
      const left = { x: -35, y: 4, z: -4, ry: Math.PI / 6 }; // Left exit position
      const offBottom = { x: 0, y: -20, z: -4, ry: 0 }; // Bottom exit position

      const init = {
        welcome: { x: 0, y: 0, z: -4, ry: 0 },
        'to-my': { x: 35, y: -6, z: 0, ry: -Math.PI / 6 },
        digital: { x: 35, y: -6, z: 0, ry: -Math.PI / 6 },
        portfolio: { x: 35, y: -6, z: 0, ry: -Math.PI / 6 },
      };

      const animateText = (mesh, entryRange, exitRange, exitTarget = left) => {
        const segmentProgress = (start, end) =>
          clamp01((homeT - start) / (end - start));

        const rawEntryP = segmentProgress(...entryRange);
        const rawExitP = segmentProgress(...exitRange);

        const entryP = easeInOutQuad(rawEntryP);
        const exitP = easeInOutQuad(rawExitP);

        // If in the entry phase → interpolate towards the center
        if (rawEntryP < 1 && rawExitP <= 0) {
          const from = init[mesh.name];
          mesh.position.x = lerp(from.x, center.x, entryP);
          mesh.position.y = lerp(from.y, center.y, entryP);
          mesh.position.z = lerp(from.z, center.z, entryP);
          mesh.rotation.y = lerp(from.ry, center.ry, entryP);
        }
        // If in the exit phase OR during the pause between entry and exit → interpolate from center towards exit
        else if (rawExitP > 0 || rawEntryP >= 1) {
          mesh.position.x = lerp(center.x, exitTarget.x, exitP);
          mesh.position.y = lerp(center.y, exitTarget.y, exitP);
          mesh.position.z = lerp(center.z, exitTarget.z, exitP);
          mesh.rotation.y = lerp(center.ry, exitTarget.ry, exitP);
        }
      };

      // Animate each text with precise overlapping segments
      animateText(welcome, [0.0, 0.1], [0.15, 0.3]);
      animateText(toMy, [0.15, 0.3], [0.4, 0.5]);
      animateText(digital, [0.35, 0.5], [0.6, 0.7]);
      animateText(portfolio, [0.6, 0.7], [0.8, 0.95], offBottom);
    }

    // ------------------------
    // Section 2: About
    // ------------------------
    if (aboutT > 0) {
      const phase1T = clamp01(aboutT / 0.25); // Phase 1: 0.0 → 0.25
      const phaseT = clamp01((aboutT - 0.26) / 0.74); // Phase 3: 0.26 → 1.0

      // Phase 1: fast approach
      if (aboutT <= 0.25) {
        const pA = easeOutCubic(phase1T);
        camera.position.z = lerp(0, -3, pA);
        wobble.position.z = lerp(0, 3, pA);
      }
      // Phase 2: very short impact
      else if (aboutT <= 0.26) {
        camera.position.z = -3;
        wobble.position.z = 3;
      }
      // Phase 3: return
      else {
        const pA = easeInOut(phaseT);
        camera.position.z = lerp(-3, 0, pA);
        wobble.position.z = lerp(3, 0, pA);
      }
    }

    // ------------------------
    // Section 3 : Projects
    // ------------------------
    if (projectsT > 0) {
      const phase1T = clamp01(projectsT / 0.2); // Phase 1: 0 → 0.2
      const phase2T = clamp01((projectsT - 0.2) / 0.8); // Phase 2: 0.2 → 1

      // Phase 1: quick camera tilt + wobble shift
      const p = easeOutCubic(phase1T);
      if (projectsT <= 0.2) {
        camera.rotation.x = lerp(0, 0.2, p); // Camera tilts upward
        wobble.position.y = lerp(0.6, 2, p); // Wobble rises slightly
      }

      // Phase 2: staggered bands + wobble return
      else {
        const bandDelay = 0.1; // Equal delay between each band
        const bandCount = projects.children.length;

        projects.children.forEach((band, i) => {
          // Each band starts after its delay
          const bandP = clamp01(
            (phase2T - i * bandDelay) / (1 - bandDelay * bandCount)
          );

          const baseY = 10 + i * 2.5;
          const midY = -2; // Slightly below zero
          const endY = -6; // Final Y position (lower)
          const endZ = -18; // Final Z position (goes backward)

          if (bandP < 0.4) {
            // 0 → 0.4 : slide downward
            const downP = easeInOut(bandP / 0.4);
            band.position.y = lerp(baseY, midY, downP);
            band.position.z = 0;
          } else {
            // 0.4 → 1 : move backward in Z
            const backP = easeOutCubic((bandP - 0.4) / 0.6);
            band.position.y = lerp(midY, endY, backP);
            band.position.z = lerp(0, endZ, backP);
            band.material.opacity = lerp(0.4, 0, backP); // Fade out
          }
        });

        // Wobble goes back down after last band starts leaving
        const lastBandP = clamp01(
          (phase2T - (bandCount - 1) * bandDelay) / 0.4
        );
        wobble.position.y = lerp(2.0, 0.6, lastBandP);

        // Wobble shrinks + warp strength decreases during Phase 2
        wobble.scale.setScalar(lerp(1, 0.8, phase2T));
        uniforms.uWarpStrength.value = lerp(1.8, 0.1, phase2T);
      }
    }

    // ------------------------
    // Section 4 : Skills
    // ------------------------
    if (skillsT > 0) {
      const phase1T = clamp01(skillsT / 0.15); // 0 → 0.15
      const phase2T = clamp01((skillsT - 0.15) / 0.2); // 0.15 → 0.35
      const phase3T = clamp01((skillsT - 0.35) / 0.4); // 0.35 → 0.75
      const phase4T = clamp01((skillsT - 0.75) / 0.25); // 0.75 → 1.0

      // Phase 1: Wobble descends
      if (skillsT <= 0.15) {
        const p = easeInOut(phase1T);
        wobble.position.y = lerp(0.6, -1, p);
      }

      // Phase 2: Wobble fixed low
      else if (skillsT <= 0.35) {
        wobble.position.y = -1;
      }

      // Phase 3: Smooth rise + wobble rotation
      else if (skillsT <= 0.75) {
        const p = easeInOut(phase3T);
        wobble.position.y = lerp(-1, 2, p);
        wobble.rotation.y += 0.02 * (1 - p);
      }

      // Phase 4: Wobble stops + camera tilt
      else {
        const p = easeOutCubic(phase4T);

        wobble.position.y = lerp(2, 8, p);
        wobble.rotation.y += 0.02 * (1 - p);
        camera.rotation.x = lerp(0.2, 0, p);
      }
    }

    // ------------------------
    // Section 5 : Contact
    // ------------------------
    if (contactT > 0) {
      const pC = easeInOut(contactT);

      // Animate Plane (Wall)
      plane.position.y = lerp(-4, 0, pC);
      plane.position.z = lerp(1, 0, pC);
      plane.rotation.x = lerp(
        THREE.MathUtils.degToRad(90),
        THREE.MathUtils.degToRad(180),
        pC
      );

      // Animate Shader Uniforms
      uniforms.uPositionFrequency.value = lerp(0.5, 0.2, pC);

      // Animate Camera Zoom
      camera.position.z = lerp(0, -2, pC);
    }
  }, [scrollProgress, getSectionProgress]);

  return (
    <div className={style.global_cont}>
      {/* Page Content */}

      {/* 3D Container */}
      <canvas className={style.webgl} id="webgl"></canvas>

      {/* Custom Cursor */}
      <Cursor cursorRef={cursorRef} />

      {/* Loader */}
      {isLoading ? (
        <Loader
          setLoader={setLoader}
          wobbleRef={wobbleRef}
          wobblePlateRef={wobblePlateRef}
          textRef={textRef}
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
