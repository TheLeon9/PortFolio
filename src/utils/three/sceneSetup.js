//=============================================================================
// sceneSetup — Scene, camera, renderer, lights, resize handler
//
// All the "Three.js boilerplate" lives here: build the scene graph root, the
// perspective camera (wrapped in a Group so we can apply the parallax offset
// without losing the camera's local transform), the WebGLRenderer with the
// right tone mapping, and a single hemisphere light. The resize handler is
// also kept here because it owns the (sizes, camera, renderer) trio.
//=============================================================================

//-- Imports ------------------------------------------------------------------
// Three.js gives us Scene, PerspectiveCamera, WebGLRenderer, lights and
// constants.
import {
  Scene,
  Color,
  PerspectiveCamera,
  Group,
  WebGLRenderer,
  PCFSoftShadowMap,
  ACESFilmicToneMapping,
  HemisphereLight,
} from 'three';

// Brand colours — used for the scene background and the hemisphere light.
import { DEFAULT_BLACK_COLOR, DEFAULT_BACKGROUND_COLOR } from '@/constants';

//-- Constants ----------------------------------------------------------------
// (None — every magic number is local to the function that needs it.)

/**
 * createScene
 * Build the root scene and paint its background with the brand off-white.
 * The background colour is later overridden by the radial gradient material,
 * but having an opaque colour up front avoids a black flash on first render.
 */
export const createScene = () => {
  const scene = new Scene();
  scene.background = new Color(DEFAULT_BACKGROUND_COLOR);
  return scene;
};

/**
 * getCanvas
 * Look up the <canvas id="webgl"> mounted by the Layout component. We use a
 * helper because the renderer needs the actual DOM node, and we want to keep
 * the lookup logic centralised in case the id ever changes.
 */
export const getCanvas = (canvasId) => document.querySelector(`#${canvasId}`);

/**
 * createSizes
 * Snapshot of the current viewport, mutated in place by `handleResize`.
 *
 * `pixelRatio` is capped at 2 to avoid burning GPU cycles on retina displays
 * with 3x or 4x DPRs that nobody can actually distinguish.
 */
export const createSizes = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
});

/**
 * createCamera
 * Build a 50° perspective camera placed slightly back from the origin and
 * wrap it in a Group. The Group is what we move when applying the parallax
 * effect — moving the camera directly would also move its `lookAt` target.
 */
export const createCamera = ({ scene, sizes }) => {
  const camera = new PerspectiveCamera(
    50,                          // FOV — narrow enough to feel cinematic
    sizes.width / sizes.height,  // aspect ratio
    0.1,                         // near plane
    100                          // far plane (anything past 100 is invisible)
  );
  // 10 units away from origin: leaves room for the wobble sphere + texts.
  camera.position.set(0, 0, 10);

  // Wrap the camera in a Group so we can offset it without affecting the
  // camera's local transform (used by the mouse parallax in animationLoop).
  const cameraGroup = new Group();
  cameraGroup.add(camera);
  scene.add(cameraGroup);

  return { camera, cameraGroup };
};

/**
 * createRenderer
 * Configure the WebGLRenderer with PCF soft shadows, ACES Filmic tone
 * mapping (the most natural looking of the built-in operators) and the
 * current viewport size.
 */
export const createRenderer = ({ canvas, sizes }) => {
  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true;
  // PCFSoftShadowMap = the smoothest of the cheap shadow filters.
  renderer.shadowMap.type = PCFSoftShadowMap;
  // ACES Filmic gives more natural highlights/shadows than the default
  // linear tone mapping.
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
  return renderer;
};

/**
 * addLights
 * Add a single HemisphereLight: the upper hemisphere is the bright off-white
 * colour, the lower hemisphere is near-black. Intensity 4 is intentionally
 * high to make the wobble sphere pop without needing additional lights.
 */
export const addLights = (scene) => {
  const light = new HemisphereLight(
    DEFAULT_BACKGROUND_COLOR, // sky colour
    DEFAULT_BLACK_COLOR,      // ground colour
    4                         // intensity
  );
  scene.add(light);
};

/**
 * registerResizeHandler
 * On every window resize, refresh the cached sizes object, fix the camera
 * aspect ratio and resize the renderer + bump the pixel ratio in case the
 * user dragged the window between two displays of different DPR.
 *
 * The handler is registered through the resource tracker so it gets removed
 * automatically on cleanup.
 */
export const registerResizeHandler = ({
  sizes,
  camera,
  renderer,
  addEventListenerTracked,
}) => {
  const handleResize = () => {
    // Update the shared sizes record (other modules read from it).
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

    // Tell the camera the new aspect ratio so the projection stays correct.
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Resize the framebuffer to match the new viewport.
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);
  };
  addEventListenerTracked(window, 'resize', handleResize);
};
