import React, { useState, useEffect } from 'react';
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

import NavBar from '@/components/partials/NavBar';
import ScrollBtn from '@/components/partials/ScrollBtn';
import ShareBtn from '@/components/partials/ShareBtn';
import Sentence from '@/components/partials/Sentence';
import Loader from '@/components/partials/Loader';

import LogoWhite from 'p/img/logo/logo_fm_white.svg';

const Layout = ({ children }) => {
  const [activeSection, setActiveSection] = useState('');
  const [isLoading, setLoader] = useState(true);

  //--------------------------------------------------+
  //
  // Color SCSS
  //
  //--------------------------------------------------+

  const white_color = '#f8f8ff';
  const black_color = '#1c1c1c';
  const dark_blue = '#0132b5';
  const medium_blue = '#2c75ff';
  const light_blue = '#26c4ec';
  const fogColor = '#d3d3d3';

  useEffect(() => {
    const debugObject = {};

    //--------------------------------------------------+
    //
    // Canva - Scene
    //
    //--------------------------------------------------+

    const canvas = document.querySelector('#webgl');

    const scene = new THREE.Scene();

    // Background
    scene.background = new THREE.Color(white_color);

    //--------------------------------------------------+
    //
    // Material - Gui Add
    //
    //--------------------------------------------------+

    // Wobble
    debugObject.mainColor = white_color;
    debugObject.secondColor = light_blue;

    // Wobble
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
      transmission: 0.1,
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

    //--------------------------------------------------+
    //
    // Gui
    //
    //--------------------------------------------------+

    // Check if there is '#debug' in the URL
    const isDebug = window.location.hash.includes('#debug');

    if (isDebug) {
      const gui = new GUI({ width: 325 });

      // Wobble Sphere
      const folderUniforms = gui.addFolder('Uniforms');
      const folderWrapUniforms = gui.addFolder('Wrap Uniforms');
      const folderMaterial = gui.addFolder('Material');
      const folderColors = gui.addFolder('Colors');

      // Tweaks lil-gui
      // Folder Uniforms
      folderUniforms
        .add(uniforms.uPositionFrequency, 'value', 0, 1, 0.001)
        .name('uPositionFrequency');
      folderUniforms
        .add(uniforms.uTimeFrequency, 'value', 0, 1, 0.001)
        .name('uTimeFrequency');
      folderUniforms
        .add(uniforms.uStrength, 'value', 0, 0.8, 0.001)
        .name('uStrength');

      // Folder Wrap Uniforms
      folderWrapUniforms
        .add(uniforms.uWarpPositionFrequency, 'value', 0, 0.5, 0.001)
        .name('uWarpPositionFrequency');
      folderWrapUniforms
        .add(uniforms.uWarpTimeFrequency, 'value', 0, 1, 0.001)
        .name('uWarpTimeFrequency');
      folderWrapUniforms
        .add(uniforms.uWarpStrength, 'value', 0, 1.8, 0.001)
        .name('uWarpStrength');

      // Folder Material
      folderMaterial.add(material, 'transmission', 0, 1, 0.001);

      // Colors
      folderColors
        .addColor(debugObject, 'mainColor')
        .onChange(() => uniforms.uMainColor.value.set(debugObject.mainColor));
      folderColors
        .addColor(debugObject, 'secondColor')
        .onChange(() =>
          uniforms.uSecondColor.value.set(debugObject.secondColor)
        );
    }

    //--------------------------------------------------+
    //
    // Geometry
    //
    //--------------------------------------------------+

    // IcoSphere
    let sphereGeometry = new THREE.IcosahedronGeometry(2.4, 50);
    sphereGeometry = mergeVertices(sphereGeometry);
    sphereGeometry.computeTangents();

    // Mesh
    const wobble = new THREE.Mesh(sphereGeometry, material);
    wobble.customDepthMaterial = depthMaterial;
    wobble.position.y = 0.6;
    scene.add(wobble);

    // Wave Plane
    let planeGeometry = new THREE.PlaneGeometry(30, 10, 100, 100);
    planeGeometry = mergeVertices(planeGeometry);
    planeGeometry.computeTangents();

    // Wave Plane Mesh
    const wavePlane = new THREE.Mesh(planeGeometry, material);
    wavePlane.customDepthMaterial = depthMaterial;
    wavePlane.rotation.y = Math.PI;
    wavePlane.rotation.x = THREE.MathUtils.degToRad(90);
    wavePlane.position.y = -4;
    wavePlane.position.z = 1;
    scene.add(wavePlane);

    //--------------------------------------------------+
    //
    // Lights
    //
    //--------------------------------------------------+

    const light = new THREE.HemisphereLight(white_color, black_color, 4);
    scene.add(light);

    //--------------------------------------------------+
    //
    // FOG
    //
    //--------------------------------------------------+

    scene.fog = new THREE.Fog(fogColor, 1, 60);

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
      50,
      sizes.width / sizes.height,
      0.1,
      100
    );

    // Camera Position
    camera.position.set(0, 0, 10);
    scene.add(camera);

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
    bloomPass.strength = 0.09;
    bloomPass.radius = 0.2;
    bloomPass.threshold = 0.2;
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

      // Render
      composer.render();

      // Call animate again on the next frame
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  //--------------------------------------------------+
  //
  //  Set the localstorage for the active Section
  //
  //--------------------------------------------------+

  useEffect(() => {
    localStorage.setItem('activeSection', activeSection);
    window.dispatchEvent(new Event('storageChange'));
  }, [activeSection]);

  const handleHomeClick = () => {
    setActiveSection('');
  };

  return (
    <div className={style.global_cont}>
      {/* Page Content */}

      {/* 3D Container */}
      <canvas className={style.webgl} id="webgl"></canvas>

      {/* Loader */}
      {isLoading ? (
        <Loader setLoader={setLoader} />
      ) : (
        <>
          {/* Corner Top Left */}
          <div className={style.home_btn_cont}>
            {/* Button Home */}
            <button onClick={handleHomeClick} className={style.home_btn}>
              <Image
                src={LogoWhite.src}
                alt="Logo FM"
                width={40}
                height={40}
                className={style.home_logo}
              />
            </button>
          </div>

          {/* Corner Top Right */}
          <ShareBtn />

          {/* Corner Bottom Right */}
          <ScrollBtn />

          {/* Corner Bottom Left */}
          <Sentence />

          {/* Navigation Bar */}
          <NavBar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />

          {children}
        </>
      )}
    </div>
  );
};

export default Layout;
