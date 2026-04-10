//=============================================================================
// initThreeScene — Orchestrator for the Three.js scene of the portfolio
//
// Responsibility: compose every helper from `src/utils/three/` into a single
// public API consumed by `src/components/layout/index.js`. The Layout
// component does not know about Three.js: it calls `initThreeScene` once on
// mount, then a handful of update helpers when the user changes a colour.
//
// All public functions keep the exact same signatures as the previous
// monolithic file so any consumer can import them without changes.
//=============================================================================

//-- Imports ------------------------------------------------------------------

// Resource tracker — owns geometries / materials / textures / listeners and
// disposes them at cleanup time.
import { createResourceTracker } from './three/resources';

// Canvas → CanvasTexture factories used by About / Projects / Skills.
import {
  createAboutTextureFactory,
  createProjectTextureFactory,
  createSkillLabelTextureFactory,
} from './three/textureGenerators';

// Shared uniforms + wobble / depth / radial materials.
import {
  createUniforms,
  createWobbleMaterial,
  createDepthMaterial,
  createRadialMaterial,
} from './three/materials';

// Scene/camera/renderer/lights helpers + resize wiring.
import {
  createScene,
  getCanvas,
  createSizes,
  createCamera,
  createRenderer,
  addLights,
  registerResizeHandler,
} from './three/sceneSetup';

// Geometry builders for every group of objects.
import { createWobbleSphere } from './three/wobbleSphere';
import { createTextGroup } from './three/textMeshes';
import { createAboutGlass, refreshAboutGlassColor } from './three/aboutGlass';
import { createProjectBands, refreshProjectBandsColor } from './three/projectBands';
import { createSkillPoints, refreshSkillsColor } from './three/skillPoints';

// Post-processing (bloom) and the render loop.
import { createPostProcessing } from './three/postProcessing';
import { startAnimationLoop } from './three/animationLoop';

// GSAP — used by stopThreeScene to kill in-flight tweens on cleanup.
import gsap from 'gsap';

// Debug GUI (lil-gui) — only mounted when `#debug` is in the URL.
import {
  buildDebugGUI,
  syncDebugDisplayValues,
  destroyDebugGUI,
} from './three/debugGUI';

//-- Module-level state -------------------------------------------------------
//
// The Layout component calls a few "update*" helpers from outside the init
// closure (e.g. when the ColorPicker changes a colour). Those helpers need
// access to the meshes, materials, factories etc. created during init, but
// we don't want to pass a giant object back to React. Instead we keep a
// single private singleton that mirrors the active scene.

/** Active scene snapshot, or null when no scene is mounted. */
let _state = null;

/** Bound `disposeAll` from the resource tracker, captured during init. */
let _disposeAll = null;

/** Animation loop controller (`{ getRequestId, cancel }`), captured during init. */
let _animation = null;

//=============================================================================
// Public API
//=============================================================================

/**
 * initThreeScene
 * Build the entire scene and start the render loop. Called once by the
 * Layout component on mount.
 *
 * @param {Object} params
 * @param {string} params.canvasId
 * @param {string} params.mainColor
 * @param {string} params.backgroundColor
 * @param {number} params.TransmissionLevel
 * @param {Object} params.wobbleRef        - React ref → wobble sphere mesh
 * @param {Object} params.wobblePlateRef   - React ref → wave plane mesh
 * @param {Object} params.customUniforms   - React ref receiving the shared uniforms
 * @param {Object} params.textRef          - React ref → text Group
 * @param {Object} params.cameraRef        - React ref → cameraGroup
 * @param {Object} params.glassRef         - React ref → about glass Group
 * @param {Object} params.projectsRef      - React ref → projects Group
 * @param {Object} params.skillsRef        - React ref → skills Group
 * @param {Object} params.cursorRef        - React ref → custom cursor DOM node
 * @param {Function} params.getScrollProgress - reads the live scroll value
 *                                              (0..100) from the proxy ref
 *                                              every frame
 * @param {Array}  params.skillsList
 * @param {Array}  params.projectsList
 */
export function initThreeScene({
  canvasId,
  mainColor,
  backgroundColor,
  TransmissionLevel,
  wobbleRef,
  wobblePlateRef,
  customUniforms,
  textRef,
  cameraRef,
  glassRef,
  projectsRef,
  skillsRef,
  cursorRef,
  getScrollProgress,
  skillsList,
  projectsList,
}) {
  //-- Resources ------------------------------------------------------------
  // Build a fresh tracker for this scene instance and destructure the
  // helpers we need below.
  const tracker = createResourceTracker();
  const {
    trackGeometry,
    trackMaterial,
    trackTexture,
    addEventListenerTracked,
    disposeAll,
  } = tracker;

  //-- Texture factories (factored out to share boilerplate) ----------------
  // Each factory closes over the texture tracker so callers don't have to
  // remember to register the texture themselves.
  const makeAboutTexture = createAboutTextureFactory(trackTexture);
  const makeProjectTexture = createProjectTextureFactory(trackTexture);
  const makeSkillLabelTexture = createSkillLabelTextureFactory(trackTexture);

  //-- Scene, sizes, camera, renderer ---------------------------------------
  const canvas = getCanvas(canvasId);
  const scene = createScene();
  const sizes = createSizes();
  const { camera, cameraGroup } = createCamera({ scene, sizes });
  const renderer = createRenderer({ canvas, sizes });
  // Expose the cameraGroup to React so it can also drive its own animations.
  cameraRef.current = cameraGroup;

  //-- Uniforms + wobble / radial materials ---------------------------------
  const uniforms = createUniforms({
    mainColor,
    secondColor: backgroundColor,
  });
  // Push the uniforms object up to React so the Layout effect can mutate it
  // when the user picks a new colour.
  customUniforms.current = uniforms;

  const material = createWobbleMaterial({
    uniforms,
    transmissionLevel: TransmissionLevel,
    trackMaterial,
  });
  const depthMaterial = createDepthMaterial({ uniforms, trackMaterial });
  const radialMaterial = createRadialMaterial({ mainColor, trackMaterial });

  //-- Wobble sphere + wave plane + radial background plane -----------------
  const { wobble, wavePlane, isMobile } = createWobbleSphere({
    scene,
    material,
    depthMaterial,
    radialMaterial,
    trackGeometry,
  });
  // Hand the meshes back to React so the Layout can animate them.
  wobbleRef.current = wobble;
  wobblePlateRef.current = wavePlane;

  //-- 3D Home text group ---------------------------------------------------
  const textGroup = createTextGroup({ scene, mainColor });
  textRef.current = textGroup;

  //-- About glass fragments ------------------------------------------------
  const { group: glassGroup, fragments: aboutFragments } = createAboutGlass({
    scene,
    mainColor,
    backgroundColor,
    trackGeometry,
    trackMaterial,
    makeAboutTexture,
  });
  glassRef.current = glassGroup;

  //-- Project rings --------------------------------------------------------
  const { group: projectsGroup, projects: sortedProjects } = createProjectBands({
    scene,
    projectsList,
    mainColor,
    backgroundColor,
    trackGeometry,
    trackMaterial,
    makeProjectTexture,
  });
  projectsRef.current = projectsGroup;

  //-- Skill points ---------------------------------------------------------
  const { group: skillsGroup } = createSkillPoints({
    scene,
    skillsList,
    mainColor,
    backgroundColor,
    trackGeometry,
    trackMaterial,
    makeSkillLabelTexture,
  });
  skillsRef.current = skillsGroup;

  //-- Lights + resize handler ----------------------------------------------
  addLights(scene);
  registerResizeHandler({ sizes, camera, renderer, addEventListenerTracked });

  //-- Post-processing (bloom) ----------------------------------------------
  const { composer } = createPostProcessing({
    renderer, scene, camera, isMobile,
  });

  //-- Shared state for the public update helpers ---------------------------
  // Anything an external update helper needs to read or write goes in here.
  _state = {
    // Current colour state — kept here for the debug GUI.
    mainColor,
    backgroundColor,
    secondColorManual: false,

    // Three.js core objects.
    scene,
    camera,
    cameraGroup,
    renderer,
    composer,
    sizes,

    // Shared shader resources.
    uniforms,
    material,
    radialMaterial,

    // Hero meshes.
    wobble,
    wavePlane,
    textGroup,

    // Section groups + their per-section data needed by refreshers.
    glassGroup,
    aboutFragments,
    projectsGroup,
    sortedProjects,
    skillsGroup,

    // Texture factories (so the debug GUI can re-run them on colour change).
    makeAboutTexture,
    makeProjectTexture,
    makeSkillLabelTexture,
  };

  // Bind dispose to the captured `scene/renderer/composer` references so
  // `stopThreeScene` doesn't need to know what they were.
  _disposeAll = () => disposeAll({ scene, renderer, composer });

  //-- Start the render loop ------------------------------------------------
  // The loop reads everything it needs from the sceneState we just built,
  // plus the scroll proxy getter coming from React.
  _animation = startAnimationLoop({
    sceneState: _state,
    getScrollProgress: getScrollProgress || (() => 0),
    cursorRef,
    addEventListenerTracked,
  });
}

/**
 * stopThreeScene
 * Cancel the animation loop, destroy the optional debug GUI and dispose
 * every tracked resource. Called by the Layout cleanup effect on unmount.
 */
export function stopThreeScene() {
  // 1) Stop the RAF loop so no further frames run.
  if (_animation) {
    _animation.cancel();
    _animation = null;
  }
  // 2) Kill every in-flight GSAP tween so no callback fires on destroyed objects.
  gsap.killTweensOf('*');
  // 3) Destroy the lil-gui panel (if it was opened).
  destroyDebugGUI();
  // 4) Dispose every tracked GPU resource and detach event listeners.
  if (_disposeAll) {
    _disposeAll();
    _disposeAll = null;
  }
  // 5) Forget the state — `initThreeScene` will rebuild it on next mount.
  _state = null;
}

/**
 * updateAboutGlassColor
 * Repaint every About fragment texture with the new colour pair.
 * No-op if the scene is not mounted (race condition during teardown).
 */
export function updateAboutGlassColor(mainColor, textColor) {
  if (!_state) return;
  refreshAboutGlassColor({
    group: _state.glassGroup,
    fragments: _state.aboutFragments,
    makeAboutTexture: _state.makeAboutTexture,
    mainColor,
    textColor,
  });
}

/**
 * updateProjectBandsColor
 * Repaint every Project ring texture with the new colour pair.
 */
export function updateProjectBandsColor(mainColor, textColor) {
  if (!_state) return;
  refreshProjectBandsColor({
    group: _state.projectsGroup,
    projects: _state.sortedProjects,
    makeProjectTexture: _state.makeProjectTexture,
    mainColor,
    textColor,
  });
}

/**
 * updateSkillsColor
 * Update the spark colours and repaint every label texture.
 */
export function updateSkillsColor(mainColor, textColor) {
  if (!_state) return;
  refreshSkillsColor({
    group: _state.skillsGroup,
    makeSkillLabelTexture: _state.makeSkillLabelTexture,
    mainColor,
    textColor,
  });
}

/**
 * updateRadialColor
 * Set both colours of the radial background gradient (centre + edges).
 */
export function updateRadialColor(mainColor) {
  if (!_state?.radialMaterial) return;
  _state.radialMaterial.uniforms.colorInt.value.set(mainColor);
  _state.radialMaterial.uniforms.colorExt.value.set(mainColor);
}

/**
 * isSecondColorManual
 * Returns true if the user opened the debug GUI and forced a custom
 * secondary colour. The Layout effect uses this to avoid overwriting the
 * manual override on every render.
 */
export function isSecondColorManual() {
  return Boolean(_state?.secondColorManual);
}

/**
 * initDebugGUI
 * Mount the lil-gui panel. The Layout calls this when `#debug` is in the
 * URL. The optional `setMainColor` lets the GUI push its colour edits back
 * into React state.
 */
export function initDebugGUI({ setMainColor } = {}) {
  if (!_state) return;
  buildDebugGUI({
    state: _state,
    setMainColor,
    refreshAllTextures: (color, bgColor) => {
      // Refresh all three texture batches in one go.
      updateAboutGlassColor(color, bgColor);
      updateProjectBandsColor(color, bgColor);
      updateSkillsColor(color, bgColor);
    },
  });
}

/**
 * syncDebugDisplay
 * Push the latest React state into the GUI sliders so they stay aligned
 * when the user changes colours through the React ColorPicker.
 */
export function syncDebugDisplay(mainColor, backgroundColor) {
  if (!_state) return;
  syncDebugDisplayValues({ state: _state, mainColor, backgroundColor });
}
