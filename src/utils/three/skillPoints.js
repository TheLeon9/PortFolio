//=============================================================================
// skillPoints — 12 glowing "spark" spheres + sprite labels for the Skills section
//
// Each skill is rendered as a tiny emissive sphere (the "spark") plus a flat
// sprite that displays the skill name above the spark. Both are wrapped in a
// Group so the Layout can move skill + label together while still being able
// to tweak their relative positions.
//=============================================================================

//-- Imports ------------------------------------------------------------------
// Three.js types: Group, SphereGeometry, MeshStandardMaterial, SpriteMaterial,
// Sprite, Vector3.
import {
  Vector3,
  Group,
  SphereGeometry,
  MeshStandardMaterial,
  Color,
  SpriteMaterial,
  Sprite,
  Mesh,
} from 'three';

//-- Constants ----------------------------------------------------------------

/**
 * Hand-placed positions for the 12 skills.
 *
 * Layout:
 *   Indices 0..5  → left side, descending in Y, getting closer to the camera.
 *   Indices 6..11 → right side, mirror of the left side.
 *
 * The shape forms a V opening towards the camera, which feels natural during
 * the Skills section reveal animation.
 */
const SKILL_POSITIONS = [
  // Left side (orders 1..6 in the constants list)
  new Vector3(-4.0, 4.0, -4.0),
  new Vector3(-4.5, 3.2, -3.0),
  new Vector3(-5.0, 2.4, -2.0),
  new Vector3(-4.5, 1.6, -1.0),
  new Vector3(-4.0, 0.8, -0.5),
  new Vector3(-3.5, 0.0, -0.5),
  // Right side (orders 7..12)
  new Vector3(4.0, 4.0, -4.0),
  new Vector3(4.5, 3.2, -3.0),
  new Vector3(5.0, 2.4, -2.0),
  new Vector3(4.5, 1.6, -1.0),
  new Vector3(4.0, 0.8, -0.5),
  new Vector3(3.5, 0.0, -0.5),
];

/**
 * getSkillPosition
 * Resolve a 1-indexed `order` (matching the constants file) to its Vector3.
 * Falls back to the origin if the order is out of range.
 */
const getSkillPosition = (order) =>
  SKILL_POSITIONS[order - 1] || new Vector3(0, 0, 0);

/**
 * createSkillPoints
 * Build the spark + label pair for every skill in `skillsList` and add the
 * resulting group to the scene.
 */
export const createSkillPoints = ({
  scene,
  skillsList,
  mainColor,
  backgroundColor,
  trackGeometry,
  trackMaterial,
  makeSkillLabelTexture,
}) => {
  // Top-level group: lets the Layout iterate over all skills with one
  // `forEach` instead of tracking 12 individual refs.
  const group = new Group();
  group.name = 'skills-group';
  scene.add(group);

  // All sparks share the same geometry to save GPU memory. 14 segments is
  // enough at the small visual size we render them at.
  const sparkGeo = trackGeometry(new SphereGeometry(0.08, 14, 14));

  // Loop over the skills coming from `@/constants`. Each iteration produces:
  //   - one spark mesh
  //   - one sprite label
  //   - a group wrapping both
  skillsList.forEach((sk) => {
    //-- Spark mesh -----------------------------------------------------------
    // Emissive material so the sphere glows even with no direct light. The
    // emissive intensity is set high (2) to make the sparks pop.
    const sparkMat = trackMaterial(new MeshStandardMaterial({
      color: new Color(mainColor),
      emissive: new Color(mainColor),
      emissiveIntensity: 2,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      // Opacity 0 at boot — the Layout fades them in during the Skills phase.
      opacity: 0,
    }));
    const spark = new Mesh(sparkGeo, sparkMat);

    //-- Sprite label ---------------------------------------------------------
    // Painted on a 1024x256 transparent canvas (see textureGenerators.js).
    const labelMap = makeSkillLabelTexture(sk.value, mainColor, backgroundColor);

    // Maintain the original aspect ratio of the canvas when scaling the
    // sprite, so the text is never stretched.
    const aspect = labelMap.image.width / labelMap.image.height;
    const labelMat = trackMaterial(new SpriteMaterial({
      map: labelMap,
      transparent: true,
      opacity: 0,    // also fades in via the Layout
      depthTest: true,
    }));
    const label = new Sprite(labelMat);
    // 6 units wide is the right size to make the text readable from the
    // resting camera distance. The Y dimension uses the canvas aspect.
    label.scale.set(6 * aspect, 2.5, 1);
    // Stash the original text on userData so the colour refresher can rebuild
    // the texture without re-running the skills loop.
    label.userData.text = sk.value;

    //-- Wrapper group --------------------------------------------------------
    // Wrap spark + label so the Layout can move both with one transform.
    const start = getSkillPosition(sk.order);
    const g = new Group();

    // Spark sits at the wrapper origin; the label is offset slightly above so
    // the text floats over the spark.
    spark.position.set(0, 0, 0);
    label.position.set(0, 0.2, 0);

    g.add(spark);
    g.add(label);
    g.position.copy(start);
    // Save the resting position so the Layout knows where to interpolate to.
    g.userData.initialPosition = g.position.clone();
    group.add(g);
  });

  return { group };
};

/**
 * refreshSkillsColor
 * Walks every spark and label inside the group and updates them to the new
 * colours. Sparks have their `.color` and `.emissive` swapped; labels get a
 * brand-new canvas texture (the previous one is disposed first).
 */
export const refreshSkillsColor = ({
  group,
  makeSkillLabelTexture,
  mainColor,
  textColor,
}) => {
  if (!group) return;

  // `traverse` walks both the wrapper Groups AND their children, so we don't
  // have to manually descend into each level.
  group.traverse((obj) => {
    // Sparks are the only meshes with an emissive property — use that as a
    // discriminator instead of comparing names.
    if (obj.isMesh && obj.material?.emissive) {
      obj.material.color.set(mainColor);
      obj.material.emissive.set(mainColor);
    }

    // Labels are sprites with a texture map and the original text on userData.
    if (obj.isSprite && obj.material?.map && obj.userData?.text) {
      const newTexture = makeSkillLabelTexture(obj.userData.text, mainColor, textColor);
      // Free the previous texture before swapping.
      if (obj.material.map) obj.material.map.dispose();
      obj.material.map = newTexture;
      obj.material.needsUpdate = true;
    }
  });
};
