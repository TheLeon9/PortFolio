//=============================================================================
// textMeshes — 3D Orbitron text (WELCOME / TO MY / DIGITAL / PORTFOLIO)
//
// Loads the Orbitron font asynchronously and produces four extruded text
// meshes that the Layout animates section by section. The font load is
// async so the Group is created and added to the scene immediately, then
// the four meshes are appended later when the font is ready.
//=============================================================================

//-- Imports ------------------------------------------------------------------
// Three.js core types (Group, MeshStandardMaterial, Color, Mesh).
import {
  Group,
  Color,
  MeshStandardMaterial,
  Mesh,
} from 'three';

// FontLoader knows how to parse the typeface JSON format produced by the
// facetype.js converter. The font lives in /public/font/ — the URL is
// resolved at runtime.
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

// TextGeometry builds an extruded mesh for a given string. We feed it the
// loaded Font and a configuration object.
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

//-- Constants ----------------------------------------------------------------

// Path served by Next.js public folder. The font is the bold variant of
// Orbitron exported via facetype.js.
const FONT_PATH = '/font/Orbitron_Bold.json';

// Visual size of each glyph in world units (matches the wobble sphere
// scale so the texts feel "the same family of objects").
const FONT_SIZE = 2.8;

// Extrusion depth in world units — keeps the text flat-ish without losing
// the 3D feel.
const TEXT_DEPTH = 0.28;

// Higher values give smoother letter curves but slower geometry build.
const CURVE_SEGMENTS = 12;

/**
 * createTextGroup
 * Build the text group, schedule the async font load, and once it resolves
 * append the four extruded meshes (WELCOME centred + TO MY / DIGITAL /
 * PORTFOLIO offset to the right).
 *
 * @param {Object} params
 * @param {THREE.Scene} params.scene
 * @param {string} params.mainColor - hex string used for the side faces
 * @returns {THREE.Group} group attached to the scene immediately
 */
export const createTextGroup = ({ scene, mainColor }) => {
  // Create the empty group up front so the Layout can grab a ref to it
  // before the font has finished loading.
  const textGroup = new Group();
  scene.add(textGroup);

  // Kick off the font load. The callback runs async — by the time it fires
  // the rest of the scene is already rendering.
  const fontLoader = new FontLoader();
  fontLoader.load(FONT_PATH, (font) => {
    // Side colour adapts to the user's main colour with a fallback to the
    // brand blue in case `mainColor` is undefined.
    const sideColor = new Color(mainColor || 0x0132b5);

    /**
     * createText
     * Helper that builds one extruded mesh for a given string.
     * Uses two materials: white front face + coloured side face.
     */
    const createText = (message) => {
      // Build the extruded geometry from the string and the loaded font.
      const geometry = new TextGeometry(message, {
        font,
        size: FONT_SIZE,
        height: TEXT_DEPTH,
        curveSegments: CURVE_SEGMENTS,
        bevelEnabled: false, // disable bevel — keeps the silhouette sharp
      });

      // Centre the geometry around its origin so positions / rotations
      // operate from the visual centre instead of the bottom-left corner.
      geometry.computeBoundingBox();
      geometry.center();
      geometry.computeVertexNormals();

      // Front face: clean white with a hint of metalness for some shimmer.
      const frontMat = new MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.4,
      });

      // Side face: brand colour, more matte so the contrast pops.
      const sideMat = new MeshStandardMaterial({
        color: sideColor,
        metalness: 0.0,
        roughness: 0.85,
      });

      // TextGeometry uses two material slots: index 0 = front/back, 1 = side.
      const mesh = new Mesh(geometry, [frontMat, sideMat]);
      // Slight vertical stretch — looks more "poster-like".
      mesh.scale.y = 1.4;
      return mesh;
    };

    // -- WELCOME ------------------------------------------------------------
    // Centred and pushed back so the wobble sphere fits in front during the
    // intro animation.
    const welcomeMesh = createText('WELCOME');
    welcomeMesh.position.set(0, 4, -12);
    welcomeMesh.name = 'welcome'; // looked up by Loader / Layout via getObjectByName
    textGroup.add(welcomeMesh);

    // -- TO MY / DIGITAL / PORTFOLIO ---------------------------------------
    // Three lines stacked off-screen to the right at boot. The Layout
    // animates them sliding in from the right during the Home section.
    const sideNames = ['to-my', 'digital', 'portfolio'];
    ['TO MY', 'DIGITAL', 'PORTFOLIO'].forEach((line, i) => {
      const mesh = createText(line);
      // gapY is intentionally 0 here — vertical stacking is handled by the
      // Layout's animation, the resting position is identical for the three.
      mesh.position.set(35, -6 + i * 0, 0);
      mesh.rotation.y = -Math.PI / 6; // 30° tilt to face the camera obliquely
      mesh.name = sideNames[i];
      textGroup.add(mesh);
    });

    // Group origin sits at the world origin — every transform is applied to
    // the meshes individually.
    textGroup.position.set(0, 0, 0);
  });

  return textGroup;
};
