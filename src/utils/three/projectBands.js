//=============================================================================
// projectBands — Rotating glass rings, one per project
//
// Each project becomes a thin LatheGeometry ring (basically a section of a
// torus) with a CanvasTexture wrapped around it. The rings are stacked
// vertically off-screen at boot, then the Layout animates them down and
// back during the Projects section. Hover/click are handled inside
// `animationLoop.js` via raycasting.
//=============================================================================

//-- Imports ------------------------------------------------------------------
// Three.js types (Group, LatheGeometry, MeshPhysicalMaterial, Mesh, Vector2).
import {
  Group,
  Vector2,
  LatheGeometry,
  MeshPhysicalMaterial,
  Mesh,
  DoubleSide,
} from 'three';

//-- Constants ----------------------------------------------------------------

// Vertical extent of each ring (top edge - bottom edge in world units).
const RING_HEIGHT = 1.2;

// Radial thickness — how "fat" the ring profile is. Small value keeps it
// looking like a flat band rather than a torus.
const RING_THICKNESS = 0.05;

// Inside radius of the ring. The outer radius is computed as
// inner + thickness inside the loop below.
const RING_INNER_RADIUS = 3.3;

// Y offset of the first ring (off-screen above the camera). Subsequent
// rings are stacked above using STACK_GAP.
const STACK_START_OFFSET = 10;
const STACK_GAP = 2.5;

/**
 * getHighlights
 * Tiny accessor that flattens a project's `highlight1..5` fields into an
 * array. Centralised so we don't repeat the same `[a, b, c, d, e]` literal
 * in two places (creation + refresh).
 */
const getHighlights = (proj) => [
  proj.highlight1,
  proj.highlight2,
  proj.highlight3,
  proj.highlight4,
  proj.highlight5,
];

/**
 * createProjectBands
 * Build one ring mesh per project, position them in a vertical stack and
 * add them to the scene. Returns the group + the sorted project list which
 * is needed later by `refreshProjectBandsColor`.
 *
 * @param {Object} params
 * @param {THREE.Scene} params.scene
 * @param {Array} params.projectsList - raw projects from `@/constants`
 * @param {string} params.mainColor
 * @param {string} params.backgroundColor
 * @param {Function} params.trackGeometry
 * @param {Function} params.trackMaterial
 * @param {Function} params.makeProjectTexture
 */
export const createProjectBands = ({
  scene,
  projectsList,
  mainColor,
  backgroundColor,
  trackGeometry,
  trackMaterial,
  makeProjectTexture,
}) => {
  // Group: lets the Layout iterate over all rings as a single unit.
  const group = new Group();
  group.name = 'projects-group';
  scene.add(group);

  // Sort by `projectNumber` so the rings stack in the order the user wants
  // (independent of the order in the constants file).
  const sortedProjects = [...projectsList].sort(
    (a, b) => (a.projectNumber || 0) - (b.projectNumber || 0)
  );

  // Build one ring per sorted project.
  sortedProjects.forEach((proj, i) => {
    // -- Texture ------------------------------------------------------------
    const highlights = getHighlights(proj);
    const tex = makeProjectTexture(
      proj.title,
      proj.description,
      highlights,
      mainColor,
      backgroundColor
    );

    // -- Geometry: 4 control points -> LatheGeometry rotates them 360° -----
    // The 4 points define a thin rectangular cross-section that, when
    // revolved around the Y axis, becomes a glass band.
    const outerRadius = RING_INNER_RADIUS + RING_THICKNESS;
    const points = [
      new Vector2(outerRadius, -RING_HEIGHT / 2),
      new Vector2(outerRadius, RING_HEIGHT / 2),
      new Vector2(RING_INNER_RADIUS, RING_HEIGHT / 2),
      new Vector2(RING_INNER_RADIUS, -RING_HEIGHT / 2),
    ];

    // 256 segments around the lathe = silky-smooth curve at any zoom level.
    const geo = trackGeometry(new LatheGeometry(points, 256));

    // -- Material: same glass settings as the About fragments --------------
    const mat = trackMaterial(new MeshPhysicalMaterial({
      map: tex,
      transparent: true,
      opacity: 0.4,
      roughness: 0.15,
      metalness: 0,
      transmission: 1.0,
      thickness: 0.5,
      ior: 1.1,
      clearcoat: 0.5,
      // DoubleSide because the camera goes through the rings during the
      // Projects animation — we need both faces visible.
      side: DoubleSide,
      // Prevent front/back faces from z-fighting against each other,
      // which causes the dark "self-shadow" stripe on transparent rings.
      depthWrite: false,
    }));

    // -- Mesh + position ---------------------------------------------------
    const ring = new Mesh(geo, mat);
    ring.rotation.set(0, 0, 0);
    // Stack vertically: ring 0 starts at +10, each next ring is +2.5 above.
    ring.position.set(0, STACK_START_OFFSET + i * STACK_GAP, 0);

    // -- Metadata for raycasting/interaction in animationLoop --------------
    ring.userData = {
      index: i,
      // Slightly randomised auto-rotation speed so the rings feel alive.
      speed: 0.01 + Math.random() * 0.02,
      // CSS class used by the cursor — see Cursor component.
      hoverClass: 'hover_target_big',
      isHovered: false,
      url: proj.url || '',
    };

    group.add(ring);
  });

  return { group, projects: sortedProjects };
};

/**
 * refreshProjectBandsColor
 * Triggered when the user picks a new colour. Walks the rings, regenerates
 * each canvas texture with the new colour pair and disposes the old ones.
 */
export const refreshProjectBandsColor = ({
  group,
  projects,
  makeProjectTexture,
  mainColor,
  textColor,
}) => {
  // Defensive: bail out if either input is missing (race condition during
  // teardown).
  if (!group || !projects) return;

  group.children.forEach((band, i) => {
    const project = projects[i];
    const highlights = getHighlights(project);
    const tex = makeProjectTexture(
      project.title,
      project.description,
      highlights,
      mainColor,
      textColor
    );

    // Free the previous texture before swapping.
    if (band.material.map) band.material.map.dispose();
    band.material.map = tex;
    band.material.needsUpdate = true;
  });
};
