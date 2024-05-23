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

import NavBar from '@/components/partials/NavBar';
import ScrollBtn from '@/components/partials/ScrollBtn';
import ShareBtn from '@/components/partials/ShareBtn';
import Loader from '@/components/partials/Loader';

import Logo from 'p/img/logo/logo_fm_black.svg';

const Layout = ({ children }) => {
  const [activeSection, setActiveSection] = useState('0');
  const [isLoading, setLoader] = useState(true);
  const wobbleRef = useRef();
  const wobblePlateRef = useRef();

  //--------------------------------------------------+
  //
  // Color SCSS
  //
  //--------------------------------------------------+

  const white_color = '#f8f8ff';
  const black_color = '#040B12';
  const main_color = '#0132b5';
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
    debugObject.mainColor = main_color;
    debugObject.secondColor = white_color;

    // Wobble
    const uniforms = {
      uTime: new THREE.Uniform(0),
      uPositionFrequency: new THREE.Uniform(0.5),
      uTimeFrequency: new THREE.Uniform(0.4),
      uStrength: new THREE.Uniform(0.3),
      uWarpPositionFrequency: new THREE.Uniform(0.4),
      uWarpTimeFrequency: new THREE.Uniform(0.1),
      uWarpStrength: new THREE.Uniform(1.8),

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

    // Gradial Material
    let radialMaterial = new THREE.ShaderMaterial({
      uniforms: {
        colorInt: { value: new THREE.Color(main_color) },
        colorExt: { value: new THREE.Color(black_color) },
        ratio: { value: window.innerWidth / window.innerHeight },
      },
      transparent: true,
      vertexShader: `varying vec2 vUv;
          void main(){
            vUv = uv;
            gl_Position = vec4(position, 1.);
          }`,
      fragmentShader: `varying vec2 vUv;
          uniform vec3 colorInt;
          uniform vec3 colorExt;
          uniform float ratio;
          void main(){
            vec2 uv = (vUv - 0.5) * vec2(ratio, 1.);
            gl_FragColor = vec4( mix( colorInt, colorExt, length(uv)), .4);
          }`,
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
    let sphereGeometry = new THREE.IcosahedronGeometry(2.4, 40);
    sphereGeometry = mergeVertices(sphereGeometry);
    sphereGeometry.computeTangents();

    // Mesh
    const wobble = new THREE.Mesh(sphereGeometry, material);
    wobble.customDepthMaterial = depthMaterial;
    wobble.position.y = 0.6;

    // We postion it in front of the camera so we can animate it at the beginning
    wobble.position.z = 6;
    scene.add(wobble);
    wobbleRef.current = wobble;

    // Wave Plane
    let planeGeometry = new THREE.PlaneGeometry(26, 8, 40, 40);
    planeGeometry = mergeVertices(planeGeometry);
    planeGeometry.computeTangents();

    // Wave Plane Mesh
    const wavePlane = new THREE.Mesh(planeGeometry, material);
    wavePlane.customDepthMaterial = depthMaterial;
    wavePlane.rotation.y = Math.PI;
    wavePlane.rotation.x = THREE.MathUtils.degToRad(100);
    wavePlane.position.y = -4;
    wavePlane.position.z = 1;
    scene.add(wavePlane);
    wobblePlateRef.current = wavePlane;

    // Background radial
    const radialPlaneGeometry = new THREE.PlaneGeometry(2, 2);
    const radialPlane = new THREE.Mesh(radialPlaneGeometry, radialMaterial);
    scene.add(radialPlane);

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

    // scene.fog = new THREE.Fog(fogColor, 0, 100);
    // scene.fog = new THREE.FogExp2( black_color, 0.02 );

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
    bloomPass.strength = 0.01;
    bloomPass.radius = 0.1;
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
    setActiveSection('0');
  };

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
          {/* Btn Share container */}
          <ShareBtn />

          {/* Button Home */}
          <div className={style.home_btn_cont}>
            <button onClick={handleHomeClick} className={style.home_btn}>
              <Image
                src={Logo.src}
                alt="Logo FM Black"
                width={40}
                height={40}
                className={style.home_logo}
              />
            </button>
          </div>

          {/* Scroll Btn container */}
          <ScrollBtn />

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
