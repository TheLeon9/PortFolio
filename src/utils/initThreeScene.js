import * as THREE from 'three';
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

// Text
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

// Temporary
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { DEFAULT_BLACK_COLOR } from '@/constants';

export function initThreeScene({
  canvasId,
  mainColor,
  backgroundColor,
  wobbleRef,
  wobblePlateRef,
  customColor,
  TransmissionLevel,
  TextRef,
  cameraRef,
}) {
  //--------------------------------------------------+
  //
  // Color SCSS
  //
  //--------------------------------------------------+

  const white_color = '#fff';
  // const fogColor = '#d3d3d3';

  //--------------------------------------------------+
  //
  // Canva - Scene
  //
  //--------------------------------------------------+

  const canvas = document.querySelector(`#${canvasId}`);

  const scene = new THREE.Scene();

  // Background
  scene.background = new THREE.Color(white_color);

  //--------------------------------------------------+
  //
  // Material - Gui Add
  //
  //--------------------------------------------------+

  // Wobble
  const debugObject = {
    mainColor,
    secondColor: backgroundColor,
  };

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
  // Link the ref
  customColor.current = uniforms;

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
    roughness: 0.5, //0 vers 1
    color: '#ffffff',
    transmission: TransmissionLevel,
    ior: 1.5, // 1 to 2.5
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
      colorInt: { value: new THREE.Color(mainColor) },
      colorExt: { value: new THREE.Color(mainColor) },
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
      .onChange(() => uniforms.uSecondColor.value.set(debugObject.secondColor));
  }

  //--------------------------------------------------+
  //
  // Geometry
  //
  //--------------------------------------------------+

  // Check if screen width is less than 1000px
  const isMobile = window.innerWidth < 1000;

  // IcoSphere
  var icoWidth = 0;
  var icoDetails = 0;
  if (isMobile) {
    icoWidth = 1.6;
    icoDetails = 30;
  } else {
    icoWidth = 2.4;
    icoDetails = 40;
  }
  let sphereGeometry = new THREE.IcosahedronGeometry(icoWidth, icoDetails);
  sphereGeometry = mergeVertices(sphereGeometry);
  sphereGeometry.computeTangents();

  // Mesh
  const wobble = new THREE.Mesh(sphereGeometry, material);
  wobble.customDepthMaterial = depthMaterial;
  wobble.position.y = 0.6;

  // We postion it in front of the camera so we can animate it at the beginning
  wobble.position.z = 6;
  wobbleRef.current = wobble;

  // Wave Plane
  var planeW = 0;
  var planeH = 0;
  var planeDetailsXY = 0;
  if (isMobile) {
    planeW = 20;
    planeH = 4;
    planeDetailsXY = 20;
  } else {
    planeW = 26;
    planeH = 8;
    planeDetailsXY = 40;
  }
  let planeGeometry = new THREE.PlaneGeometry(
    planeW,
    planeH,
    planeDetailsXY,
    planeDetailsXY
  );
  planeGeometry = mergeVertices(planeGeometry);
  planeGeometry.computeTangents();

  // Wave Plane Mesh
  const wavePlane = new THREE.Mesh(planeGeometry, material);
  wavePlane.customDepthMaterial = depthMaterial;
  wavePlane.rotation.y = Math.PI;
  wavePlane.rotation.x = THREE.MathUtils.degToRad(100);
  wavePlane.position.y = -4;
  wavePlane.position.z = 1;
  wobblePlateRef.current = wavePlane;

  // Background radial
  const radialPlaneGeometry = new THREE.PlaneGeometry(2, 2);
  const radialPlane = new THREE.Mesh(radialPlaneGeometry, radialMaterial);

  scene.add(wobble, wavePlane, radialPlane);

  //--------------------------------------------------+
  //
  // Text
  //
  //--------------------------------------------------+

  // Main text group
  const textGroup = new THREE.Group();
  scene.add(textGroup);
  TextRef.current = textGroup;

  const fontLoader = new FontLoader();
  fontLoader.load('/font/Orbitron_Bold.json', (font) => {
    // -------- CONFIG --------
    const fontSize = 2.8;
    const depth = 0.28;
    const curveSegments = 12;
    const frontColor = 0xffffff;
    const sideColor = new THREE.Color(debugObject?.mainColor || 0x0132b5);
    // ------------------------

    const createText = (message) => {
      const geometry = new TextGeometry(message, {
        font,
        size: fontSize,
        height: depth,
        curveSegments,
        bevelEnabled: false,
      });

      geometry.computeBoundingBox();
      geometry.center();
      geometry.computeVertexNormals();

      const frontMat = new THREE.MeshStandardMaterial({
        color: frontColor,
        metalness: 0.1,
        roughness: 0.4,
      });

      const sideMat = new THREE.MeshStandardMaterial({
        color: sideColor,
        metalness: 0.0,
        roughness: 0.85,
      });

      const mesh = new THREE.Mesh(geometry, [frontMat, sideMat]);
      mesh.scale.y = 1.4;
      return mesh;
    };

    // Create meshes
    const welcomeMesh = createText('WELCOME');
    welcomeMesh.position.set(0, 0, -4); // centered and pushed back
    welcomeMesh.name = 'welcome';
    textGroup.add(welcomeMesh);

    // Offset parameters
    const rightOffsetX = 20; // right distance
    const startY = -8; // down distance
    const gapY = -8; // text space

    const sideNames = ['to-my', 'digital', 'portfolio'];
    ['TO MY', 'DIGITAL', 'PORTFOLIO'].forEach((line, i) => {
      const mesh = createText(line);

      mesh.position.set(rightOffsetX, startY + i * gapY, 5);

      mesh.rotation.y = -Math.PI / 2;

      mesh.name = sideNames[i];
      textGroup.add(mesh);
    });

    textGroup.position.set(0, 0, 0);
  });

  //--------------------------------------------------+
  //
  // Lights
  //
  //--------------------------------------------------+

  const light = new THREE.HemisphereLight(white_color, DEFAULT_BLACK_COLOR, 4);
  scene.add(light);

  //--------------------------------------------------+
  //
  // FOG
  //
  //--------------------------------------------------+

  // scene.fog = new THREE.Fog(DEFAULT_BLACK_COLOR, 0, 100);
  // scene.fog = new THREE.FogExp2( DEFAULT_BLACK_COLOR, 0.02 );

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
  const cameraGroup = new THREE.Group();
  cameraGroup.add(camera);
  cameraRef.current = cameraGroup;
  scene.add(cameraGroup);

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
    x: 0,
    y: 0,
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
  bloomPass.strength = 0;
  bloomPass.radius = 0;
  bloomPass.threshold = 0;
  // bloomPass.strength = 0.01;
  // bloomPass.radius = 0.1;
  // bloomPass.threshold = 0.1;
  composer.addPass(bloomPass);

  //--------------------------------------------------+
  //
  // Animate function
  //
  //--------------------------------------------------+

  // Enable controls temporarily
  const controls = new OrbitControls(camera, renderer.domElement);
  // controls.enableDamping = true; // smoother movement
  // controls.enabled = true; // disable later when done placing

  const clock = new THREE.Clock();

  const animate = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update time uniform
    customColor.current.uTime.value = elapsedTime;

    // Calculate the desired parallax offset based on cursor position
    // Lower multiplier = more subtle movement
    const parallaxX = mouse.x * -0.1; // Horizontal parallax intensity
    const parallaxY = mouse.y * -0.1; // Vertical parallax intensity

    // Smoothly interpolate camera group position toward the target offset
    // Lower factor = smoother and slower transition
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 0.04; // Horizontal easing
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 0.04; // Vertical easing

    // Render
    composer.render();

    // required for damping
    // controls.update();

    // Call animate again on the next frame
    requestAnimationFrame(animate);
  };

  animate();
}
