import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import style from './index.module.scss';

import * as THREE from 'three';
import gsap from 'gsap';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

// Shaders
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import wobbleVertexShader from './shaders/wobble/vertex.glsl';
import wobbleFragmentShader from './shaders/wobble/fragment.glsl';

// Render
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import NavBar from '@/components/partials/NavBar';
import ScrollBtn from '@/components/partials/ScrollBtn';
import ShareBtn from '@/components/partials/ShareBtn';
import Sentence from '@/components/partials/Sentence';
import Loader from '@/components/partials/Loader';

import LogoWhite from 'p/img/logo/logo_fm_white.svg';

const Layout = ({ children }) => {
  const [activeSection, setActiveSection] = useState('');
  const [isLoading, setLoader] = useState(false);

  useEffect(() => {
    //--------------------------------------------------+
    //
    // Gui
    //
    //--------------------------------------------------+

    const gui = new GUI({ width: 325 });

    const folderUniforms = gui.addFolder('Uniforms');
    const folderWrapUniforms = gui.addFolder('Wrap Uniforms');
    const folderMaterial = gui.addFolder('Material');
    const folderColors = gui.addFolder('Colors');
    const debugObject = {};

    //--------------------------------------------------+
    //
    // Canva - Scene
    //
    //--------------------------------------------------+

    const canvas = document.querySelector('#webgl');

    const scene = new THREE.Scene();

    //--------------------------------------------------+
    //
    // Material - Gui Add
    //
    //--------------------------------------------------+

    debugObject.mainColor = '#26c4ec';
    debugObject.secondColor = '#9370db';

    const uniforms = {
      uTime: new THREE.Uniform(0),
      uPositionFrequency: new THREE.Uniform(0.5),
      uTimeFrequency: new THREE.Uniform(0.4),
      uStrength: new THREE.Uniform(0.3),
      uWarpPositionFrequency: new THREE.Uniform(0.38),
      uWarpTimeFrequency: new THREE.Uniform(0.12),
      uWarpStrength: new THREE.Uniform(1.7),

      // Colors
      uMainColor: new THREE.Uniform(new THREE.Color(debugObject.mainColor)),
      uSecondColor: new THREE.Uniform(new THREE.Color(debugObject.secondColor)),
    };

    // Material
    const material = new CustomShaderMaterial({
      // Custom Shader Material
      baseMaterial: THREE.MeshPhysicalMaterial,
      vertexShader: wobbleVertexShader,
      fragmentShader: wobbleFragmentShader,
      silent: true,

      uniforms: uniforms,

      // MeshPhysicalMaterial
      metalness: 0,
      roughness: 0.5,
      color: '#ffffff',
      transmission: 0,
      ior: 1.5,
      thickness: 1.5,
      transparent: true,
      wireframe: false,
    });

    // Material
    const depthMaterial = new CustomShaderMaterial({
      // Custom Shader Material
      baseMaterial: THREE.MeshDepthMaterial,
      vertexShader: wobbleVertexShader,
      silent: true,

      uniforms: uniforms,

      // MeshDepthMaterial
      depthPacking: THREE.RGBADepthPacking,
    });

    // Tweaks lil-gui
    // Folder Uniforms
    folderUniforms
      .add(uniforms.uPositionFrequency, 'value', 0, 2, 0.001)
      .name('uPositionFrequency');
    folderUniforms
      .add(uniforms.uTimeFrequency, 'value', 0, 2, 0.001)
      .name('uTimeFrequency');
    folderUniforms
      .add(uniforms.uStrength, 'value', 0, 2, 0.001)
      .name('uStrength');

    // Folder Wrap Uniforms
    folderWrapUniforms
      .add(uniforms.uWarpPositionFrequency, 'value', 0, 2, 0.001)
      .name('uWarpPositionFrequency');
    folderWrapUniforms
      .add(uniforms.uWarpTimeFrequency, 'value', 0, 2, 0.001)
      .name('uWarpTimeFrequency');
    folderWrapUniforms
      .add(uniforms.uWarpStrength, 'value', 0, 2, 0.001)
      .name('uWarpStrength');

    // Folder Material
    folderMaterial.add(material, 'metalness', 0, 1, 0.001);
    folderMaterial.add(material, 'roughness', 0, 1, 0.001);
    folderMaterial.add(material, 'transmission', 0, 1, 0.001);
    folderMaterial.add(material, 'ior', 0, 10, 0.001);
    folderMaterial.add(material, 'thickness', 0, 10, 0.001);

    // Colors
    folderColors
      .addColor(debugObject, 'mainColor')
      .onChange(() => uniforms.uMainColor.value.set(debugObject.mainColor));
    folderColors
      .addColor(debugObject, 'secondColor')
      .onChange(() => uniforms.uSecondColor.value.set(debugObject.secondColor));

    //--------------------------------------------------+
    //
    // Geometry
    //
    //--------------------------------------------------+

    // IcoSphere
    let geometry = new THREE.IcosahedronGeometry(2.5, 50);
    geometry = mergeVertices(geometry);
    geometry.computeTangents();

    // Mesh
    const wobble = new THREE.Mesh(geometry, material);
    wobble.customDepthMaterial = depthMaterial;
    wobble.receiveShadow = true;
    wobble.castShadow = true;
    scene.add(wobble);

    // Plane
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(15, 15, 15),
      new THREE.MeshStandardMaterial()
    );
    plane.receiveShadow = true;
    plane.rotation.y = Math.PI;
    plane.position.y = -5;
    plane.position.z = 5;
    scene.add(plane);

    //--------------------------------------------------+
    //
    // Lights
    //
    //--------------------------------------------------+

    const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.normalBias = 0.05;
    directionalLight.position.set(0.25, 2, -2.25);

    scene.add(directionalLight);

    //--------------------------------------------------+
    //
    // Sizes
    //
    //--------------------------------------------------+

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    };

    window.addEventListener('resize', () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(sizes.pixelRatio);
    });

    //--------------------------------------------------+
    //
    // Camera
    //
    //--------------------------------------------------+

    const camera = new THREE.PerspectiveCamera(
      35,
      sizes.width / sizes.height,
      0.1,
      100
    );

    // Camera Position
    camera.position.set(13, -3, -5);
    scene.add(camera);

    //--------------------------------------------------+
    //
    // Controls
    //
    //--------------------------------------------------+

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    //--------------------------------------------------+
    //
    // Renderer
    //
    //--------------------------------------------------+

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });

    // width / height
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);

    //--------------------------------------------------+
    //
    // Mouse event
    //
    //--------------------------------------------------+

    const mouse = {
      x: undefined,
      y: undefined,
    };

    window.addEventListener('mousemove', (event) => {
      mouse.x = (event.clientX / sizes.width) * 2 - 1;
      mouse.y = -(event.clientY / sizes.height) * 2 + 1;
    });

    //--------------------------------------------------+
    //
    // Post-processing
    //
    //--------------------------------------------------+

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass();
    bloomPass.strength = 0.1;
    bloomPass.radius = 1;
    bloomPass.threshold = 0.1;
    composer.addPass(bloomPass);

    //--------------------------------------------------+
    //
    // Animate function
    //
    //--------------------------------------------------+

    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Materials
      uniforms.uTime.value = elapsedTime;

      // Update controls
      controls.update();

      // Render
      composer.render();

      // Call animate again on the next frame
      requestAnimationFrame(animate);
    };

    animate();

    setTimeout(() => {
      setLoader(false);
    }, 2000);
  }, []);

  //--------------------------------------------------+
  //
  //  Set the localstorage for the active Section
  //
  //--------------------------------------------------+

  // useEffect(() => {
  //   localStorage.setItem('activeSection', activeSection);
  //   window.dispatchEvent(new Event('storageChange'));
  // }, [activeSection]);

  // const handleHomeClick = () => {
  //   setActiveSection('');
  // };

  return (
    <div className={style.global_cont}>
      {/* Page Content */}

      {/* 3D Container */}
      <canvas className={style.webgl} id="webgl"></canvas>

      {/* Mettre le code du dessous ici */}
    </div>
  );
};

export default Layout;

// {/* Loader */}
// {isLoading ? (
//   <Loader />
// ) : (
//   <>
//     {/* Corner Top Left */}
//     <div className={style.home_btn_cont}>
//       {/* Button Home */}
//       <button onClick={handleHomeClick} className={style.home_btn}>
//         <Image
//           src={LogoWhite.src}
//           alt="Logo FM"
//           width={40}
//           height={40}
//           className={style.home_logo}
//         />
//       </button>
//     </div>

//     {/* Corner Top Right */}
//     <ShareBtn />

//     {/* Corner Bottom Right */}
//     <ScrollBtn />

//     {/* Corner Bottom Left */}
//     <Sentence />

//     {/* Navigation Bar */}
//     <NavBar
//       activeSection={activeSection}
//       setActiveSection={setActiveSection}
//     />

//     {children}
//   </>
// )}
