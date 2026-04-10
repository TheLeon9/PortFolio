//=============================================================================
// aboutGlass — Five glass fragments shown during the About section
//
// Each fragment is a thin BoxGeometry with a MeshPhysicalMaterial that uses
// transmission to look like real glass, and a CanvasTexture painted with one
// piece of personal info (lastname, firstname, age, location, description).
// The texture is regenerated whenever the user picks a new colour.
//=============================================================================

//-- Imports ------------------------------------------------------------------
// Three.js types: Group, BoxGeometry, MeshPhysicalMaterial, Mesh, Vector3.
import {
  Vector3,
  Group,
  BoxGeometry,
  MeshPhysicalMaterial,
  Mesh,
  FrontSide,
} from 'three';

// User profile data — single source of truth for what each fragment shows.
import { userList } from '@/constants';

//-- Constants ----------------------------------------------------------------

/**
 * Hand-picked Vector3 positions of the 5 fragments.
 * Order matches `buildFragmentsData` below — index 0 = lastname, etc.
 * They form a star-like cluster: two top, two middle, one bottom.
 */
const ABOUT_POSITIONS = [
  new Vector3(-2, 2, 10), // lastname  — top left
  new Vector3(2, 2, 10),  // firstname — top right
  new Vector3(-3, 0, 10), // age       — middle left
  new Vector3(3, 0, 10),  // location  — middle right
  new Vector3(0, -2, 10), // description — bottom centre
];

/**
 * buildFragmentsData
 * Pull the relevant fields from `userList` and shape them as `{ label, type }`
 * records consumed by both the initial creation pass and the
 * `refreshAboutGlassColor` updater.
 *
 * Built lazily (function instead of const) so changes to `userList` at HMR
 * time are picked up immediately.
 */
const buildFragmentsData = () => [
  { label: userList.lastName, type: 'lastname' },
  { label: userList.firstName, type: 'firstname' },
  { label: `${userList.year} years old`, type: 'age' },
  { label: `${userList.city}, ${userList.country}`, type: 'location' },
  { label: userList.description, type: 'description' },
];

/**
 * createAboutGlass
 * Create the Group, build the 5 fragment meshes with their canvas textures
 * and orientations, and add the group to the scene.
 *
 * @returns {{ group: THREE.Group, fragments: Array }} group + raw fragment
 *   data (the latter is needed by `refreshAboutGlassColor`).
 */
export const createAboutGlass = ({
  scene,
  mainColor,
  backgroundColor,
  trackGeometry,
  trackMaterial,
  makeAboutTexture,
}) => {
  // Snapshot of the data at creation time.
  const fragments = buildFragmentsData();

  // Group lets the Layout move all five fragments at once during the About
  // section animation.
  const group = new Group();
  group.name = 'about-glass-group'; // useful for debugging in the Three inspector
  scene.add(group);

  // Build one mesh per fragment.
  fragments.forEach((frag, i) => {
    // -- Texture ------------------------------------------------------------
    // Painted on a 1024x256 canvas (see textureGenerators.js).
    const tex = makeAboutTexture(frag.label, mainColor, backgroundColor);

    // -- Geometry & material -----------------------------------------------
    // Wide and thin: 2 x 1 x 0.1 looks like a glass card from any angle.
    const geo = trackGeometry(new BoxGeometry(2, 1, 0.1));

    // MeshPhysicalMaterial with transmission = real glass refraction.
    const mat = trackMaterial(new MeshPhysicalMaterial({
      map: tex,
      transparent: true,
      opacity: 0.4,        // partial transparency on top of transmission
      roughness: 0.15,     // mostly smooth — slight microsurface for realism
      metalness: 0,
      transmission: 1.0,   // 1 = fully refractive
      thickness: 0.5,      // virtual depth for transmission
      ior: 1.1,            // close to water (1.33) for soft refraction
      clearcoat: 0.5,      // reflective layer on top of the glass
      side: FrontSide,
    }));

    // -- Mesh + transform --------------------------------------------------
    const glass = new Mesh(geo, mat);
    const start = ABOUT_POSITIONS[i] || new Vector3(0, 0, 0);

    // Rotation depends on the X position so the cluster looks fanned out:
    //   • centre fragment: tilted on X (looking slightly down)
    //   • right fragments: rotated negatively on Y (facing left)
    //   • left fragments:  rotated positively on Y (facing right)
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
      // Defensive fallback — should never happen given the literal array.
      glass.rotation.set(0, 0, 0);
    }

    // Apply the position and remember the resting state — the Layout uses
    // `userData.initialPosition` to interpolate during the About animation.
    glass.position.copy(start);
    glass.userData.initialPosition = start.clone();
    glass.userData.initialRotation = glass.rotation.clone();
    group.add(glass);
  });

  return { group, fragments };
};

/**
 * refreshAboutGlassColor
 * Triggered by the ColorPicker effect inside `Layout`. For each fragment,
 * regenerate its canvas texture with the new colour pair, dispose the old
 * one to free GPU memory, and assign the new texture in place.
 */
export const refreshAboutGlassColor = ({
  group,
  fragments,
  makeAboutTexture,
  mainColor,
  textColor,
}) => {
  // No-op if the group has not been built yet (race during cleanup).
  if (!group) return;

  group.children.forEach((glass, i) => {
    // Look up the matching fragment data by index — order is stable.
    const frag = fragments[i];
    const tex = makeAboutTexture(frag.label, mainColor, textColor);

    // Free the previous canvas texture immediately to avoid GPU leaks.
    if (glass.material.map) glass.material.map.dispose();
    glass.material.map = tex;
    glass.material.needsUpdate = true;
  });
};
