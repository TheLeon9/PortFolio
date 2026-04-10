//=============================================================================
// wobbleSphere — Icosahedron sphere, wave plane and radial background plane
//
// These three meshes share the same wobble material so they look like one
// continuous, organic surface. They are split here from `materials.js`
// because the geometry construction (with mobile-aware detail levels and
// vertex/tangent recomputation) is meaty enough to deserve its own file.
//=============================================================================

//-- Imports ------------------------------------------------------------------
// Three.js core types.
import {
  IcosahedronGeometry,
  PlaneGeometry,
  Mesh,
  MathUtils,
} from 'three';

// `mergeVertices` welds duplicate vertices created by IcosahedronGeometry —
// without it, the normals are flat and the lighting looks faceted instead of
// smooth.
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

//-- Constants ----------------------------------------------------------------
// Below this width we treat the device as mobile and downgrade the geometry
// detail levels to keep the framerate playable on mid-tier phones.
const MOBILE_BREAKPOINT = 1000;

/**
 * createWobbleSphere
 * Build the main wobble sphere, the wave plane that flips up during the
 * Contact section, and the full-screen radial gradient plane. Adds the three
 * meshes to the scene and returns the references the orchestrator needs.
 *
 * @param {Object} params
 * @param {THREE.Scene} params.scene
 * @param {THREE.Material} params.material         - shared wobble material
 * @param {THREE.Material} params.depthMaterial    - shared depth material
 * @param {THREE.ShaderMaterial} params.radialMaterial
 * @param {Function} params.trackGeometry          - resource tracker tap
 */
export const createWobbleSphere = ({
  scene,
  material,
  depthMaterial,
  radialMaterial,
  trackGeometry,
}) => {
  // Decide once whether we are on a mobile-class viewport.
  const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

  //-- Icosahedron sphere -----------------------------------------------------
  // Width and subdivision count: the higher the detail, the smoother the
  // displacement, but also the heavier on the GPU.
  const icoWidth = isMobile ? 1.6 : 2.4;
  const icoDetails = isMobile ? 30 : 40;

  // Build the geometry, then weld duplicates and recompute tangents so the
  // normal mapping inside the shader behaves correctly.
  let sphereGeometry = trackGeometry(
    new IcosahedronGeometry(icoWidth, icoDetails)
  );
  sphereGeometry = mergeVertices(sphereGeometry);
  sphereGeometry.computeTangents();

  // Build the mesh, attach the custom depth material so shadows match the
  // displaced surface, and place it slightly above the centre.
  const wobble = new Mesh(sphereGeometry, material);
  wobble.customDepthMaterial = depthMaterial;
  wobble.position.y = 0.6;
  // Push it forward in Z at boot so the loader can animate it back to its
  // resting position.
  wobble.position.z = 6;

  //-- Wave plane -------------------------------------------------------------
  // Same trick as the sphere: lower the subdivision count on mobile for
  // perf, but keep the surface large enough on the Y axis so the wall
  // backs the entire Contact form once it has flipped up.
  const planeW = isMobile ? 22 : 26;
  const planeH = isMobile ? 8 : 8;
  const planeDetails = isMobile ? 20 : 40;

  let planeGeometry = trackGeometry(
    new PlaneGeometry(planeW, planeH, planeDetails, planeDetails)
  );
  planeGeometry = mergeVertices(planeGeometry);
  planeGeometry.computeTangents();

  const wavePlane = new Mesh(planeGeometry, material);
  wavePlane.customDepthMaterial = depthMaterial;
  // Initial orientation: laid almost vertically (100°), facing the camera.
  // The Layout animates `rotation.x` to 180° during the Contact section so
  // it ends up acting like a wall behind the contact form.
  wavePlane.rotation.y = Math.PI;
  wavePlane.rotation.x = MathUtils.degToRad(100);
  wavePlane.position.y = -4;
  wavePlane.position.z = 1;

  //-- Radial background plane ------------------------------------------------
  // A 2x2 plane drawn directly in clip space (see `createRadialMaterial`),
  // so the size literally does not matter — only the geometry needs to exist
  // for the shader to be invoked.
  const radialPlaneGeometry = trackGeometry(new PlaneGeometry(2, 2));
  const radialPlane = new Mesh(radialPlaneGeometry, radialMaterial);

  // Add all three meshes to the scene in one call.
  scene.add(wobble, wavePlane, radialPlane);

  return { wobble, wavePlane, radialPlane, isMobile };
};
