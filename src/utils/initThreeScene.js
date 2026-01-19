import * as THREE from 'three';
import GUI from 'lil-gui';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import gsap from 'gsap';

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

import {
  DEFAULT_BLACK_COLOR,
  DEFAULT_BACKGROUND_COLOR,
  userList,
} from '@/constants';

// For the refresh of the scene
let requestId;
export function stopThreeScene() {
  if (requestId) cancelAnimationFrame(requestId);
}

// For the color Picker of the About Glass
let _aboutFrag = [];
let _aboutRef = null;
let _makeAboutTexture = null;
export function updateAboutGlassColor(mainColor, textColor) {
  if (!_aboutRef) return;

  _aboutRef.children.forEach((glass, i) => {
    const frag = _aboutFrag[i];
    const tex = _makeAboutTexture(frag.label, mainColor, textColor);

    if (glass.material.map) {
      glass.material.map.dispose();
    }
    glass.material.map = tex;
    glass.material.needsUpdate = true;
  });
}

// For the color Picker of the Projects Bands
let _projects = [];
let _projectsRef = null;
let _makeProjectTexture = null;
export function updateProjectBandsColor(mainColor, textColor) {
  if (!_projectsRef || !_projects) return;

  _projectsRef.children.forEach((band, i) => {
    const project = _projects[i];
    const highlights = [
      project.highlight1,
      project.highlight2,
      project.highlight3,
      project.highlight4,
      project.highlight5,
    ];

    const tex = _makeProjectTexture(
      project.title,
      project.description,
      highlights,
      mainColor,
      textColor
    );
    if (band.material.map) {
      band.material.map.dispose();
    }
    band.material.map = tex;
    band.material.needsUpdate = true;
  });
}

// For the color Picker of the Skills Points
let _skills = [];
let _skillsRef = null;
let _makeSkillLabelTexture = null;
export function updateSkillsColor(mainColor, textColor) {
  if (!_skillsRef || !_skills) return;

  _skillsRef.traverse((obj) => {
    if (obj.isMesh && obj.material?.emissive) {
      obj.material.color.set(mainColor);
      obj.material.emissive.set(mainColor);
    }

    if (obj.isSprite && obj.material?.map && obj.userData?.text) {
      const newTexture = _makeSkillLabelTexture(
        obj.userData.text,
        mainColor,
        textColor
      );

      if (obj.material.map) {
        obj.material.map.dispose();
      }
      obj.material.map = newTexture;
      obj.material.needsUpdate = true;
    }
  });
}

export function initThreeScene({
  canvasId,
  mainColor,
  backgroundColor,
  wobbleRef,
  wobblePlateRef,
  customUniforms,
  TransmissionLevel,
  textRef,
  cameraRef,
  user,
  glassRef,
  skillsList,
  skillsRef,
  projectsList,
  projectsRef,
  cursorRef,
}) {
  //--------------------------------------------------+
  //
  // Color SCSS
  //
  //--------------------------------------------------+

  const white_color = DEFAULT_BACKGROUND_COLOR;
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
  customUniforms.current = uniforms;

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

  //scene.add(wavePlane, radialPlane);
  scene.add(wobble, wavePlane, radialPlane);

  //--------------------------------------------------+
  //
  // Text
  //
  //--------------------------------------------------+

  // Main text group
  const textGroup = new THREE.Group();
  scene.add(textGroup);
  textRef.current = textGroup;

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
    welcomeMesh.position.set(0, 4, -12); // centered and pushed back
    welcomeMesh.name = 'welcome';
    textGroup.add(welcomeMesh);

    // Offset parameters
    const rightOffsetX = 35; // right distance
    const startY = -6; // down distance
    const gapY = 0; // text space

    const sideNames = ['to-my', 'digital', 'portfolio'];
    ['TO MY', 'DIGITAL', 'PORTFOLIO'].forEach((line, i) => {
      const mesh = createText(line);

      mesh.position.set(rightOffsetX, startY + i * gapY, 0);

      mesh.rotation.y = -Math.PI / 6;

      mesh.name = sideNames[i];
      textGroup.add(mesh);
    });

    textGroup.position.set(0, 0, 0);
  });

  //--------------------------------------------------+
  //
  // About Glass Fragments
  //
  //--------------------------------------------------+

  // ---------- DATA ----------
  const aboutFragmentsData = [
    {
      label: userList.lastName,
      type: 'lastname',
    },
    {
      label: userList.firstName,
      type: 'firstname',
    },
    {
      label: `${userList.year} years old`,
      type: 'age',
    },
    {
      label: `${userList.city}, ${userList.country}`,
      type: 'location',
    },
    {
      label: userList.description,
      type: 'description',
    },
  ];

  const aboutGlassGroup = new THREE.Group();
  aboutGlassGroup.name = 'about-glass-group';
  glassRef.current = aboutGlassGroup;
  _aboutFrag = aboutFragmentsData;
  _aboutRef = aboutGlassGroup;

  scene.add(aboutGlassGroup);

  // ---------- TEXTURE TEXT (CANVAS) ----------
  const makeAboutTexture = (text, colorBg, textColor) => {
    const sizeX = 1024;
    const sizeY = 256;
    const canvas = document.createElement('canvas');
    canvas.width = sizeX;
    canvas.height = sizeY;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, sizeX, sizeY);

    // === Background ===
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, sizeX, sizeY);

    // === Common text styles ===
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 40;

    // === Text ===
    ctx.font = 'bold 60px Orbitron, sans-serif';
    ctx.lineWidth = 2;
    ctx.strokeStyle =
      textColor.toLowerCase() === DEFAULT_BACKGROUND_COLOR
        ? DEFAULT_BLACK_COLOR
        : DEFAULT_BACKGROUND_COLOR;

    ctx.strokeText(text, sizeX / 2, sizeY / 2);
    ctx.fillStyle = textColor;
    ctx.fillText(text, sizeX / 2, sizeY / 2);

    // === Create texture from canvas ===
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    tex.minFilter = THREE.LinearMipMapLinearFilter;
    tex.magFilter = THREE.LinearFilter;

    return tex;
  };

  _makeAboutTexture = makeAboutTexture;

  // ---------- MANUAL ABOUT POSITIONS ----------
  const aboutPositions = [
    new THREE.Vector3(-2, 2, 10), // lastname
    new THREE.Vector3(2, 2, 10), // firstname
    new THREE.Vector3(-3, 0, 10), // age
    new THREE.Vector3(3, 0, 10), // location
    new THREE.Vector3(0, -2, 10), // description
  ];

  // Helper
  const getAboutPosition = (index) => {
    return aboutPositions[index] || new THREE.Vector3(0, 0, 0);
  };

  // ---------- CREATION FRAGMENTS ----------
  aboutFragmentsData.forEach((frag, i) => {
    const tex = makeAboutTexture(frag.label, mainColor, backgroundColor);

    const geo = new THREE.BoxGeometry(2, 1, 0.1);

    const mat = new THREE.MeshPhysicalMaterial({
      map: tex,
      transparent: true,
      opacity: 0.4,
      roughness: 0.15,
      metalness: 0,
      transmission: 1.0,
      thickness: 0.5,
      ior: 1.1,
      clearcoat: 0.5,
      side: THREE.FrontSide,
    });

    const glass = new THREE.Mesh(geo, mat);

    // ---- POSITION
    const start = getAboutPosition(i);

    // ---- ROTATION
    if (start.x === 0) {
      glass.rotation.x = -0.2;
      glass.rotation.y = 0;
    } else if (start.x > 0) {
      glass.rotation.y = -0.2;
      glass.rotation.x = 0;
    } else if (start.x < 0) {
      glass.rotation.y = 0.2;
      glass.rotation.x = 0;
    } else {
      glass.rotation.set(0, 0, 0);
    }

    // Stacked position
    glass.position.copy(start);
    glass.userData.initialPosition = start.clone();
    glass.userData.initialRotation = glass.rotation.clone();
    aboutGlassGroup.add(glass);
  });

  //--------------------------------------------------+
  //
  // Project Bands
  //
  //--------------------------------------------------+

  const projectsGroup = new THREE.Group();
  projectsGroup.name = 'projects-group';
  projectsRef.current = projectsGroup;
  _projects = projectsList;
  _projectsRef = projectsGroup;

  scene.add(projectsGroup);

  // Helper: Create canvas texture for each band
  const makeProjectTexture = (
    title,
    description,
    highlights = [],
    colorBg,
    textColor
  ) => {
    const sizeX = 1024;
    const sizeY = 512;
    const canvas = document.createElement('canvas');
    canvas.width = sizeX;
    canvas.height = sizeY;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, sizeX, sizeY);

    // === Background ===
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, sizeX, sizeY);

    // === Common text styles ===
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 40;

    // === Title ===
    ctx.font = `bold 42px Orbitron, sans-serif`;
    ctx.lineWidth = 2;
    ctx.strokeStyle =
      textColor.toLowerCase() === DEFAULT_BACKGROUND_COLOR
        ? DEFAULT_BLACK_COLOR
        : DEFAULT_BACKGROUND_COLOR;

    const titleY = sizeY - 120;

    ctx.strokeText(title, sizeX / 2, titleY);
    ctx.fillStyle = textColor;
    ctx.fillText(title, sizeX / 2, titleY);

    // === Highlights ===
    ctx.font = `12px Orbitron, sans-serif`;
    ctx.fillStyle = textColor;
    ctx.shadowBlur = 20;
    ctx.textAlign = 'right';
    ctx.lineWidth = 0.5; // Slightly smaller stroke
    ctx.strokeStyle =
      textColor.toLowerCase() === DEFAULT_BACKGROUND_COLOR
        ? DEFAULT_BLACK_COLOR
        : DEFAULT_BACKGROUND_COLOR;

    const highlightStartX = sizeX / 2 + 190; // Horizontal offset from title center
    let highlightStartY = titleY + 30; // Starts below the title
    const lineHeight = 16; // Line spacing between highlights

    highlights.forEach((highlight) => {
      ctx.strokeText(highlight, highlightStartX, highlightStartY);
      ctx.fillText(highlight, highlightStartX, highlightStartY);
      highlightStartY += lineHeight;
    });

    // === Description (with line wrapping) ===
    if (description) {
      ctx.font = `12px Orbitron, sans-serif`;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'left';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 0.5;
      ctx.strokeStyle =
        textColor.toLowerCase() === DEFAULT_BACKGROUND_COLOR
          ? DEFAULT_BLACK_COLOR
          : DEFAULT_BACKGROUND_COLOR;

      // === Editable config ===
      const descStartX = 20; // Left margin
      const descStartY = titleY - 20; // Vertical offset from title
      const descLineHeight = 20; // Line spacing
      const descMaxWidth = 300; // Max line width
      // =======================

      const words = description.split(' ');
      let line = '';
      let y = descStartY;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > descMaxWidth && i > 0) {
          ctx.strokeText(line, descStartX, y);
          ctx.fillText(line, descStartX, y);
          line = words[i] + ' ';
          y += descLineHeight;
        } else {
          line = testLine;
        }
      }

      // Draw last line
      ctx.strokeText(line, descStartX, y);
      ctx.fillText(line, descStartX, y);
    }

    // === Create texture from canvas ===
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    tex.minFilter = THREE.LinearMipMapLinearFilter;
    tex.magFilter = THREE.LinearFilter;

    return tex;
  };

  _makeProjectTexture = makeProjectTexture;

  // We sort Projects by Order
  const sortedProjects = [...projectsList].sort(
    (a, b) => (a.projectNumber || 0) - (b.projectNumber || 0)
  );

  sortedProjects.forEach((proj, i) => {
    const highlights = [
      proj.highlight1,
      proj.highlight2,
      proj.highlight3,
      proj.highlight4,
      proj.highlight5,
    ];

    const tex = makeProjectTexture(
      proj.title,
      proj.description,
      highlights,
      mainColor,
      backgroundColor
    );

    const height = 1.2;
    const thickness = 0.05;
    const innerRadius = 3.3;
    const outerRadius = innerRadius + thickness;

    const points = [
      new THREE.Vector2(outerRadius, -height / 2),
      new THREE.Vector2(outerRadius, height / 2),
      new THREE.Vector2(innerRadius, height / 2),
      new THREE.Vector2(innerRadius, -height / 2),
    ];

    const geo = new THREE.LatheGeometry(points, 256);

    const mat = new THREE.MeshPhysicalMaterial({
      map: tex,
      transparent: true,
      opacity: 0.4,
      roughness: 0.15,
      metalness: 0,
      transmission: 1.0,
      thickness: 0.5,
      ior: 1.1,
      clearcoat: 0.5,
      side: THREE.DoubleSide,
    });

    const ring = new THREE.Mesh(geo, mat);
    const startOffset = 10;

    // Default ring orientation
    ring.rotation.set(0, 0, 0);

    // Stacked position
    ring.position.set(0, startOffset + i * 2.5, 0);

    // Store metadata (for raycasting or interaction)
    ring.userData = {
      index: i,
      speed: 0.01 + Math.random() * 0.02,
      hoverClass: 'hover_target_big',
      isHovered: false,
      url: proj.url || '',
    };

    projectsGroup.add(ring);
  });

  //--------------------------------------------------+
  //
  // Skill Points
  //
  //--------------------------------------------------+

  // ---------- GROUP ----------
  const skillsGroup = new THREE.Group();
  skillsGroup.name = 'skills-group';
  skillsRef.current = skillsGroup;
  _skills = skillsList;
  _skillsRef = skillsGroup;

  scene.add(skillsGroup);

  // Spark geometry (define before use)
  const sparkGeo = new THREE.SphereGeometry(0.08, 14, 14); // slightly bigger + smoother

  // ---------- LABEL TEXTURE ----------
  const makeSkillLabelTexture = (text, color, textColor) => {
    const width = 1024;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    // Text styles (no background, glowing text only)
    ctx.font = 'bold 12px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 20;
    ctx.lineWidth = 0.5;
    ctx.strokeStyle =
      textColor.toLowerCase() === DEFAULT_BACKGROUND_COLOR
        ? DEFAULT_BLACK_COLOR
        : DEFAULT_BACKGROUND_COLOR;

    const centerX = width / 2;
    const centerY = height / 2;

    ctx.strokeText(text, centerX, centerY);
    ctx.fillStyle = color;
    ctx.fillText(text, centerX, centerY);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    tex.minFilter = THREE.LinearMipMapLinearFilter;
    tex.magFilter = THREE.LinearFilter; // softer to reduce pixelation

    return tex;
  };

  _makeSkillLabelTexture = makeSkillLabelTexture;

  // ---------- MANUAL PATTERN POSITIONS ----------
  const skillPositions = [
    // Left side (order 1–6)
    new THREE.Vector3(-4.0, 4.0, -4.0), // fond
    new THREE.Vector3(-4.5, 3.2, -3.0),
    new THREE.Vector3(-5.0, 2.4, -2.0),
    new THREE.Vector3(-4.5, 1.6, -1.0),
    new THREE.Vector3(-4.0, 0.8, -0.5),
    new THREE.Vector3(-3.5, 0.0, -0.5), // plus proche de la caméra

    // Right side (order 7–12 → mirror of left position)
    new THREE.Vector3(4.0, 4.0, -4.0),
    new THREE.Vector3(4.5, 3.2, -3.0),
    new THREE.Vector3(5.0, 2.4, -2.0),
    new THREE.Vector3(4.5, 1.6, -1.0),
    new THREE.Vector3(4.0, 0.8, -0.5),
    new THREE.Vector3(3.5, 0.0, -0.5),
  ];

  // Fonction to get the skill position depending of his order
  const getSkillPosition = (order) => {
    return skillPositions[order - 1] || new THREE.Vector3(0, 0, 0);
  };

  // ---------- RANDOM POSITION (custom rules) ----------
  // const randomSkillPosition = (order) => {
  //   const isLeft = order <= 6; // 6 first to the left

  //   let x;

  //   if (isLeft) {
  //     x = -8 + Math.random() * (8 - 3); // [-8, -3]
  //   } else {
  //     x = 3 + Math.random() * (8 - 3); // [3, 8]
  //   }

  //   const y = -2 + Math.random() * 2; // [-2, 0]
  //   const z = -4 + Math.random() * 3; // [-4, -1]

  //   return new THREE.Vector3(x, y, z);
  // };

  // ---------- CREATE SKILLS ----------
  skillsList.forEach((sk) => {
    const sparkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(mainColor),
      emissive: new THREE.Color(mainColor),
      emissiveIntensity: 2, // brighter sparks
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0,
    });
    const spark = new THREE.Mesh(sparkGeo, sparkMat);

    // Create text label (canvas sprite)
    const labelMap = makeSkillLabelTexture(
      sk.value,
      mainColor,
      backgroundColor
    );
    const aspect = labelMap.image.width / labelMap.image.height;
    const labelMat = new THREE.SpriteMaterial({
      map: labelMap,
      transparent: true,
      opacity: 0,
      depthTest: true,
    });
    const label = new THREE.Sprite(labelMat);
    label.scale.set(6 * aspect, 2.5, 1); // much larger labels
    label.userData.text = sk.value;

    // --- Place spark & label
    // const start = randomSkillPosition(sk.order);
    const start = getSkillPosition(sk.order);
    const g = new THREE.Group();

    // Position spark and label relative to the group center
    spark.position.set(0, 0, 0);
    label.position.set(0, 0.2, 0);

    g.add(spark);
    g.add(label);

    // Position the group at the target start position
    g.position.copy(start);
    g.userData.initialPosition = g.position.clone();
    skillsGroup.add(g);
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
  bloomPass.strength = 0.1;
  bloomPass.radius = 0.9;
  bloomPass.threshold = 0.12;
  composer.addPass(bloomPass);

  //--------------------------------------------------+
  //
  // Animate function
  //
  //--------------------------------------------------+

  // Enable controls temporarily
  // const controls = new OrbitControls(camera, renderer.domElement);
  // controls.enableDamping = true; // smoother movement
  // controls.enabled = true; // disable later when done placing

  const clock = new THREE.Clock();
  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2();

  let hoveredBand = null; // track the hovered element

  // Mouse event listener
  window.addEventListener('mousemove', (e) => {
    mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // PointerDown event listener
  window.addEventListener('pointerdown', () => {
    const intersects = raycaster.intersectObjects(
      projectsRef.current.children,
      true
    );

    if (intersects.length > 0) {
      const band = intersects[0].object;

      if (band.userData?.url) {
        window.open(band.userData.url, '_blank');
      }
    }
  });

  const animate = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update shader uniforms
    customUniforms.current.uTime.value = elapsedTime;

    // Camera parallax effect
    const parallaxX = mouse.x * -0.1;
    const parallaxY = mouse.y * -0.1;
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 0.04;
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 0.04;

    // Auto rotation of bands + hover detection
    if (projectsRef.current) {
      projectsRef.current.children.forEach((band) => {
        band.rotation.y += 0.001;
      });

      // Hover detection
      raycaster.setFromCamera(mouseVec, camera);
      const intersects = raycaster.intersectObjects(
        projectsRef.current.children,
        true
      );
      const cursor = cursorRef.current;

      if (intersects.length > 0) {
        const band = intersects[0].object;

        if (hoveredBand !== band) {
          // reset previous hover
          if (hoveredBand) {
            gsap.to(hoveredBand.scale, {
              x: 1,
              y: 1,
              z: 1,
              duration: 0.3,
              ease: 'power2.out',
            });
          }

          // new hover
          hoveredBand = band;
          gsap.to(band.scale, {
            x: 1.1,
            y: 1.1,
            z: 1.1,
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(cursor, { scale: 2, duration: 0.25, ease: 'power2.out' });
        }
      } else {
        // when mouse exits hover area
        if (hoveredBand) {
          gsap.to(hoveredBand.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
          hoveredBand = null;

          gsap.to(cursor, { scale: 1, duration: 0.25, ease: 'power2.out' });
        }
      }
    }

    // Subtle rotation of the wobble sphere based on cursor position
    if (wobbleRef.current) {
      // Apply slight rotation based on cursor position
      const rotationSpeed = 0.002; // Rotation speed
      wobbleRef.current.rotation.x += -mouse.y * rotationSpeed; // Rotation on the X axis
      wobbleRef.current.rotation.y += mouse.x * rotationSpeed; // Rotation on the Y axis
    }

    // Render the scene
    composer.render();
    // controls.update();

    requestId = requestAnimationFrame(animate);
  };

  animate();
}
