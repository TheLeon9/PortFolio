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

  // 3D ref
  const wobbleRef = useRef();
  const wobblePlateRef = useRef();
  const customColor = useRef();
  const textRef = useRef();
  const cameraRef = useRef();
  const projectsRef = useRef();
  const skillsRef = useRef();
  const { skills, projects } = useConstants();

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
      customColor,
      TransmissionLevel,
      textRef,
      cameraRef,
      skills,
      skillsRef,
      projects,
      projectsRef,
    });
  }, []);

  //--------------------------------------------------+
  //
  //  Update Colors
  //
  //--------------------------------------------------+
  useEffect(() => {
    // Update shader uniforms
    customColor.current?.uMainColor.value.set(mainColor);
    customColor.current?.uSecondColor.value.set(backgroundColor);

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
    skillsRef.current?.traverse((obj) => {
      if (obj.isMesh && obj.material?.emissive) {
        obj.material.color.set(mainColor);
        obj.material.emissive.set(mainColor);
      }
    });
    // Update project ring textures & materials
    projectsRef.current?.traverse((obj) => {
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

    if (!camera || !wobble || !plane) return;

    // Section Progresses
    const homeT = getSectionProgress(scrollProgress, sections[0].range);
    const aboutT = getSectionProgress(scrollProgress, sections[1].range);
    const projectsT = getSectionProgress(scrollProgress, sections[2].range);
    const skillsT = getSectionProgress(scrollProgress, sections[3].range);
    const contactT = getSectionProgress(scrollProgress, sections[4].range);

    // ------------------------
    // Section 1: Home
    // ------------------------
    if (homeT < 1) {
      const group = textRef.current;
      if (!group) return;

      const welcome = group.getObjectByName('welcome');
      const toMy = group.getObjectByName('to-my');
      const digital = group.getObjectByName('digital');
      const portfolio = group.getObjectByName('portfolio');

      if (!welcome || !toMy || !digital || !portfolio) return;

      // Utils
      const lerp = (a, b, t) => a + (b - a) * t;
      const clamp01 = (v) => Math.max(0, Math.min(1, v));
      const segmentProgress = (start, end) =>
        clamp01((homeT - start) / (end - start));

      // Positions
      const center = { x: 0, y: 0, z: -4, ry: 0 }; // Center position
      const left = { x: -30, y: 4, z: -4, ry: Math.PI / 6 }; // Left exit position
      const offBottom = { x: 0, y: -20, z: -4, ry: 0 }; // Bottom exit position

      const init = {
        welcome: { x: 0, y: 0, z: -4, ry: 0 },
        'to-my': { x: 30, y: -6, z: 0, ry: -Math.PI / 6 },
        digital: { x: 30, y: -6, z: 0, ry: -Math.PI / 6 },
        portfolio: { x: 30, y: -6, z: 0, ry: -Math.PI / 6 },
      };

      const animateText = (mesh, entryRange, exitRange, exitTarget = left) => {
        const easeInOutQuad = (t) =>
          t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

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

    // // ------------------------
    // // Section 2 : About
    // // ------------------------
    // if (aboutT > 0) {
    //   const t = clamp01(aboutT);
    //   // Camera avance vers wobble
    //   camera.position.z = lerp(0, -2, t);
    //   camera.position.y = lerp(0, 1.5, t);
    //   camera.rotation.x = lerp(0, -0.25, t);
    //   // Wobble avance légèrement
    //   wobble.position.z = lerp(0.6, 1, t);
    //   wobble.position.y = lerp(0.6, 1.2, t);
    //   wobble.scale.setScalar(lerp(1, 1.2, t));
    //   customColor.current.uWarpStrength.value = lerp(1.8, 2.2, t);
    // }

    // // ------------------------
    // // Section 3 : Projects
    // // ------------------------
    // if (projectsT > 0) {
    //   const t = clamp01(projectsT);
    //   camera.rotation.x = lerp(-0.25, 0.35, t);
    //   // Projects descendent
    //   projectsRef.current?.children.forEach((band, i) => {
    //     const baseY = 10 + i * 2.5;
    //     const endY = -5 + i * 2.5;
    //     band.position.y = lerp(baseY, endY, t);
    //   });
    //   // Wobble perd de la force
    //   wobble.scale.setScalar(lerp(1.2, 0.4, t));
    //   customColor.current.uWarpStrength.value = lerp(2.2, 0.1, t);
    // }

    // // ------------------------
    // // Section 4 : Skills
    // // ------------------------
    // if (skillsT > 0) {
    //   const t = clamp01(skillsT);
    //   camera.rotation.x = lerp(0.35, 0, t);
    //   wobble.position.y = lerp(0.4, 0.6, t);
    //   wobble.scale.setScalar(lerp(0.4, 1, t));
    //   customColor.current.uWarpStrength.value = lerp(0.1, 1.8, t);

    //   // Skills movement
    //   skillsRef.current?.children.forEach((g) => {
    //     const spark = g.children[0];
    //     const label = g.children[1];
    //     const start = new THREE.Vector3(0, -12, -30);
    //     const tp = spark.userData.target.clone();
    //     const pos = start.clone().lerp(tp, smoothstep(0, 0.3, t));
    //     spark.position.copy(pos);
    //     const lp = start
    //       .clone()
    //       .lerp(label.userData.target, smoothstep(0, 0.3, t));
    //     label.position.copy(lp);
    //   });
    // }

    // // ------------------------
    // // Section 5 : Contact
    // // ------------------------
    // if (contactT > 0) {
    //   const t = clamp01(contactT);
    //   wobble.position.y = lerp(0.6, 12, t);
    //   plane.position.y = lerp(0, 0, t);
    //   camera.position.z = lerp(-2, -5, t);
    //   customColor.current.uWarpStrength.value = lerp(1.8, 0.4, t);
    // }
  }, [scrollProgress, getSectionProgress]);

  // // ----- Animation About (Section 2 => index 1) -----
  // useEffect(() => {}, [scrollProgress]);

  // // ----- Animation PROJECTS (Section 3 => index 2) -----
  // useEffect(() => {
  //   if (
  //     !projectsRef.current ||
  //     !cameraRef.current ||
  //     !wobbleRef.current ||
  //     !customColor.current
  //   )
  //     return;

  //   const t = getSectionProgress(scrollProgress, [50, 75]); // 0 → 1
  //   const clamp01 = (v) => Math.max(0, Math.min(1, v));
  //   const lerp = (a, b, x) => a + (b - a) * x;
  //   const tt = clamp01(t);

  //   const camera = cameraRef.current;
  //   const wobble = wobbleRef.current;
  //   const uniforms = customColor.current;

  //   // --- Camera ---
  //   camera.rotation.x = lerp(0, 0.35, tt); // incline vers le bas

  //   // --- Project Bands ---
  //   projectsRef.current.children.forEach((band, i) => {
  //     const baseY = 10 + i * 2.5; // espacement initial conservé
  //     const endY = -20 + i * 3; // même espacement mais plus bas
  //     band.position.y = lerp(baseY, endY, tt);
  //   });

  //   // --- Wobble Sphere ---
  //   wobble.scale.setScalar(lerp(1, 0.8, tt)); // rapetisse
  //   uniforms.uWarpStrength.value = lerp(1.8, 0.1, tt); // perd sa force
  // }, [scrollProgress, getSectionProgress]);

  // // ----- Animation SKILLS (Section 4 => index 3) -----
  // useEffect(() => {
  //   if (
  //     !skillsRef.current ||
  //     !wobbleRef.current ||
  //     !customColor.current ||
  //     !cameraRef.current
  //   )
  //     return;

  //   const t = getSectionProgress(scrollProgress, sections[3].range); // 0..1
  //   const clamp01 = (v) => Math.max(0, Math.min(1, v));
  //   const lerp = (a, b, x) => a + (b - a) * x;
  //   const smoothstep = (e0, e1, x) => {
  //     const tt = clamp01((x - e0) / (e1 - e0));
  //     return tt * tt * (3 - 2 * tt);
  //   };

  //   const enter = smoothstep(0.0, 0.3, t); // arrivée
  //   const idle = smoothstep(0.3, 0.7, t); // phase calme
  //   const eject = smoothstep(0.7, 1.0, t); // éjection

  //   const camera = cameraRef.current;
  //   const wobble = wobbleRef.current;
  //   const uniforms = customColor.current;

  //   // --- Camera : remise droite et légère remontée ---
  //   camera.rotation.x = lerp(0.35, 0, t); // depuis inclinaison des Projects → droite

  //   // --- Wobble Sphere : descente progressive pour rester visible ---
  //   wobble.position.y = lerp(0, 0.6, t); // depuis hauteur finale des Projects → position normale
  //   wobble.scale.setScalar(lerp(0.4, 1, t)); // si tu veux qu’elle retrouve sa taille normale
  //   uniforms.uWarpStrength.value = lerp(0.2, 1.8, t); // récupération du wobble

  //   // ----- Gestion des Skills (inchangé) -----
  //   skillsRef.current.children.forEach((g) => {
  //     const spark = g.children[0]; // Mesh
  //     const label = g.children[1]; // Sprite
  //     const start = new THREE.Vector3(0, -12, -30);
  //     const tp = spark.userData.target.clone();
  //     const pos = start.clone().lerp(tp, enter);
  //     spark.position.copy(pos);

  //     const lp = start
  //       .clone()
  //       .lerp(label.userData.target, enter)
  //       .add(new THREE.Vector3(0, label.userData.offsetY, 0));
  //     label.position.copy(lp);

  //     if (eject > 0) {
  //       const dir = spark.userData.dir;
  //       const kick = eject * eject * 6.0;
  //       spark.position.addScaledVector(dir, kick);
  //       label.position.addScaledVector(dir, kick);
  //     }
  //   });
  // }, [scrollProgress, getSectionProgress]);

  // // ----- Animation Contact (Section 5 => index 4) -----
  // useEffect(() => {
  //   const sphere = wobbleRef.current;
  //   const plane = wobblePlateRef.current;
  //   const camera = cameraRef.current;
  //   const uniforms = customColor.current;

  //   if (!sphere || !plane || !camera || !uniforms) return;

  //   const progress = getSectionProgress(scrollProgress, sections[4].range); // 0..1
  //   const clamp01 = (v) => Math.max(0, Math.min(1, v));
  //   const lerp = (a, b, t) => a + (b - a) * t;
  //   const t = clamp01(progress);

  //   // Animate Sphere
  //   sphere.position.y = lerp(0.6, 12, t);

  //   // Animate Plane (Mur)
  //   plane.position.y = lerp(-4, 0, t);
  //   plane.position.z = lerp(1, 0, t);
  //   plane.rotation.x = lerp(
  //     THREE.MathUtils.degToRad(90),
  //     THREE.MathUtils.degToRad(180),
  //     t
  //   );

  //   // Animate Camera Zoom
  //   camera.position.z = lerp(0, -2, t);

  //   // Animate Shader Uniforms
  //   if (uniforms.uWarpStrength) {
  //     uniforms.uWarpStrength.value = lerp(1.8, 0.4, t);
  //   }

  //   if (uniforms.uPositionFrequency) {
  //     uniforms.uPositionFrequency.value = lerp(0.5, 0.2, t);
  //   }
  // }, [scrollProgress]);

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
