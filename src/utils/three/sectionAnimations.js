//=============================================================================
// sectionAnimations — Per-section 3D animations driven by scrollProgress
//
// Used to live inside a giant `useEffect` in `Layout/index.js` that re-ran on
// every React re-render of `scrollProgress`. We've extracted it into a pure
// function so the RAF loop in `animationLoop.js` can call it on every frame
// directly, with zero React involvement during a scroll.
//
// `runSectionAnimations(scrollProgress, sceneState)` is the only export the
// loop calls. It mutates the Three.js objects in place — same logic as the
// old React effect.
//=============================================================================

//-- Imports ------------------------------------------------------------------

// Used by the Contact section to convert degrees to radians.
import { MathUtils } from 'three';

// Section ranges (each one is `[min, max]` in the 0..100 scroll model).
import { sections } from '@/constants';

//-- Math helpers (module-level so they aren't recreated each frame) ----------

/** Linear interpolation between a and b at parameter t (0..1). */
const lerp = (a, b, t) => a + (b - a) * t;

/** Clamp a number into [0, 1]. */
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** Smoothstep easing — slow start, fast middle, slow end. */
const easeInOut = (x) => x * x * (3 - 2 * x);

/** Cubic ease-out — fast start, slow end. */
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

/** Quadratic ease-in-out — symmetric, slightly snappier than easeInOut. */
const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

/**
 * getSectionProgress
 * Map a global scroll value (0..100) into a 0..1 progress relative to a
 * single section range. Identical to the helper exposed by ThemeContext —
 * duplicated here so this module is self-contained for the RAF loop.
 */
const getSectionProgress = (scroll, range) => {
  const [min, max] = range;
  return Math.min(Math.max((scroll - min) / (max - min), 0), 1);
};

//-- Section 1 constants (Home text choreography) ----------------------------
// Reference positions for the WELCOME / TO MY / DIGITAL / PORTFOLIO meshes.
// Module-level so they are not rebuilt every frame.

const HOME_CENTER = { x: 0, y: 0, z: -4, ry: 0 };
const HOME_LEFT_EXIT = { x: -35, y: 4, z: -4, ry: Math.PI / 6 };
const HOME_BOTTOM_EXIT = { x: 0, y: -20, z: -4, ry: 0 };

const HOME_INIT_POSITIONS = {
  welcome: { x: 0, y: 0, z: -4, ry: 0 },
  'to-my': { x: 35, y: -6, z: 0, ry: -Math.PI / 6 },
  digital: { x: 35, y: -6, z: 0, ry: -Math.PI / 6 },
  portfolio: { x: 35, y: -6, z: 0, ry: -Math.PI / 6 },
};

//=============================================================================
// runSectionAnimations
//=============================================================================

/**
 * runSectionAnimations
 * Apply all per-section 3D transforms based on the current scroll value.
 * Called from `animationLoop.js` on every RAF frame, so React is never on
 * the hot path of a scroll.
 *
 * @param {number} scrollProgress - 0..100 from the custom scroll proxy
 * @param {Object} state - sceneState built by `initThreeScene`
 */
export const runSectionAnimations = (scrollProgress, state) => {
  // Snapshot every ref so the closure does not re-read them on every line.
  // Defensive: bail out if any of them is missing (race during teardown).
  //
  // IMPORTANT: we target `cameraGroup` (the wrapper), not the inner camera.
  // The original Layout effect did the same — it stored `cameraGroup` in the
  // React ref under the `cameraRef` name. Touching `state.camera` directly
  // would teleport the camera by 10 units (its local Z offset inside the
  // group), producing a massive zoom artifact past section 1.
  const camera = state.cameraGroup;
  const wobble = state.wobble;
  const plane = state.wavePlane;
  const group = state.textGroup;
  const uniforms = state.uniforms;
  const glass = state.glassGroup;
  const projects = state.projectsGroup;
  const skills = state.skillsGroup;

  if (
    !camera ||
    !wobble ||
    !plane ||
    !group ||
    !uniforms ||
    !glass ||
    !projects ||
    !skills
  )
    return;

  // Compute the relative progress (0..1) inside each section.
  const homeT = getSectionProgress(scrollProgress, sections[0].range);
  const aboutT = getSectionProgress(scrollProgress, sections[1].range);
  const projectsT = getSectionProgress(scrollProgress, sections[2].range);
  const skillsT = getSectionProgress(scrollProgress, sections[3].range);
  const contactT = getSectionProgress(scrollProgress, sections[4].range);

  //-- Section 1 : Home -------------------------------------------------------
  if (homeT > 0) {
    // Look up the four named text meshes inside the Group.
    const welcome = group.getObjectByName('welcome');
    const toMy = group.getObjectByName('to-my');
    const digital = group.getObjectByName('digital');
    const portfolio = group.getObjectByName('portfolio');

    // Bail if any mesh is missing (font might not be loaded yet).
    if (welcome && toMy && digital && portfolio) {
      /**
       * animateText
       * Two-phase animator. Each text mesh has an entry segment
       * (init → center) and an exit segment (center → exitTarget).
       */
      const animateText = (mesh, entryRange, exitRange, exitTarget = HOME_LEFT_EXIT) => {
        const segmentProgress = (start, end) =>
          clamp01((homeT - start) / (end - start));

        const rawEntryP = segmentProgress(...entryRange);
        const rawExitP = segmentProgress(...exitRange);
        const entryP = easeInOutQuad(rawEntryP);
        const exitP = easeInOutQuad(rawExitP);

        if (rawEntryP < 1 && rawExitP <= 0) {
          // Phase A: still entering — interpolate from init → center.
          const from = HOME_INIT_POSITIONS[mesh.name];
          mesh.position.x = lerp(from.x, HOME_CENTER.x, entryP);
          mesh.position.y = lerp(from.y, HOME_CENTER.y, entryP);
          mesh.position.z = lerp(from.z, HOME_CENTER.z, entryP);
          mesh.rotation.y = lerp(from.ry, HOME_CENTER.ry, entryP);
        } else if (rawExitP > 0 || rawEntryP >= 1) {
          // Phase B: exiting — interpolate from center → exitTarget.
          mesh.position.x = lerp(HOME_CENTER.x, exitTarget.x, exitP);
          mesh.position.y = lerp(HOME_CENTER.y, exitTarget.y, exitP);
          mesh.position.z = lerp(HOME_CENTER.z, exitTarget.z, exitP);
          mesh.rotation.y = lerp(HOME_CENTER.ry, exitTarget.ry, exitP);
        }
      };

      // Stagger the four texts so the sequence reads as a single animation.
      animateText(welcome, [0.0, 0.1], [0.15, 0.3]);
      animateText(toMy, [0.15, 0.3], [0.4, 0.5]);
      animateText(digital, [0.35, 0.5], [0.6, 0.7]);
      // PORTFOLIO drops down off-screen instead of going left.
      animateText(portfolio, [0.6, 0.7], [0.8, 0.95], HOME_BOTTOM_EXIT);
    }
  }

  //-- Section 2 : About ------------------------------------------------------
  if (aboutT > 0) {
    // Three sub-phases of the About section.
    const phase1T = clamp01(aboutT / 0.33);
    const phase2T = clamp01((aboutT - 0.33) / 0.33);
    const phase3T = clamp01((aboutT - 0.66) / 0.34);

    if (aboutT <= 0.33) {
      // Phase 1: wobble pulls back, glass fragments come forward.
      const p = easeOutCubic(phase1T);
      wobble.position.z = lerp(0, -3, p);

      glass.children.forEach((frag) => {
        const basePos = frag.userData.initialPosition;
        frag.position.z = lerp(basePos.z, 0, p);
        frag.position.x = basePos.x;
        frag.position.y = basePos.y;
        if (frag.material) {
          frag.material.opacity = 0.4;
          frag.material.needsUpdate = true;
        }
      });
    } else if (aboutT <= 0.66) {
      // Phase 2: camera pushes forward, fragments slide further (z 0 → 1).
      const p = easeOutCubic(phase2T);
      camera.position.z = lerp(0, -3, p);

      glass.children.forEach((frag) => {
        const basePos = frag.userData.initialPosition;
        frag.position.z = lerp(0, 1, p);
        frag.position.x = basePos.x;
        frag.position.y = basePos.y;
        if (frag.material) {
          frag.material.opacity = 0.4;
          frag.material.needsUpdate = true;
        }
      });
    } else {
      // Phase 3: everything returns to its resting state.
      const p = easeInOut(phase3T);
      camera.position.z = lerp(-3, 0, p);
      wobble.position.z = lerp(-3, 0, p);

      glass.children.forEach((frag) => {
        const basePos = frag.userData.initialPosition;
        frag.position.z = lerp(1, basePos.z, p);
        frag.position.x = basePos.x;
        frag.position.y = basePos.y;
        if (frag.material) {
          frag.material.opacity = 0.4;
          frag.material.needsUpdate = true;
        }
      });
    }
  }

  //-- Section 3 : Projects ---------------------------------------------------
  if (projectsT > 0) {
    // Two sub-phases: a quick intro then the long ring cascade.
    const phase1T = clamp01(projectsT / 0.2);
    const phase2T = clamp01((projectsT - 0.2) / 0.8);

    if (projectsT <= 0.2) {
      // Phase 1: tilt the camera up and lift the wobble sphere.
      const p = easeOutCubic(phase1T);
      camera.rotation.x = lerp(0, 0.2, p);
      wobble.position.y = lerp(0.6, 2, p);
    } else {
      // Phase 2: rings come down one after the other, then drift back.
      const bandDelay = 0.1;
      const bandCount = projects.children.length;

      projects.children.forEach((band, i) => {
        const bandP = clamp01(
          (phase2T - i * bandDelay) / (1 - bandDelay * bandCount)
        );

        const baseY = 10 + i * 2.5;
        const midY = -2;
        const endY = -6;
        const endZ = -18;

        if (bandP < 0.4) {
          // First 40% of the per-ring progress: fall from baseY to midY.
          const downP = easeInOut(bandP / 0.4);
          band.position.y = lerp(baseY, midY, downP);
          band.position.z = 0;
        } else {
          // Remaining 60%: drift back in Z and fade out.
          const backP = easeOutCubic((bandP - 0.4) / 0.6);
          band.position.y = lerp(midY, endY, backP);
          band.position.z = lerp(0, endZ, backP);
          band.material.opacity = lerp(0.4, 0, backP);
        }
      });

      // Drop the wobble back to its resting position once the last ring
      // has started exiting.
      const lastBandP = clamp01(
        (phase2T - (bandCount - 1) * bandDelay) / 0.4
      );
      wobble.position.y = lerp(2.0, 0.6, lastBandP);
      wobble.scale.setScalar(lerp(1, 0.8, phase2T));
      uniforms.uWarpStrength.value = lerp(1.8, 0.1, phase2T);
    }
  }

  //-- Section 4 : Skills -----------------------------------------------------
  if (skillsT > 0) {
    // Three sub-phases with staggered per-skill timing.
    //   Phase 1 (0.00–0.35): sparks rise in one by one (cascade).
    //   Phase 2 (0.35–0.75): sparks hold V-formation, gentle lift.
    //   Phase 3 (0.75–1.00): sparks scatter outward and fade.
    //
    // The wobble follows ONE continuous curve across the entire section so
    // there are no jarring direction changes between phases.
    const phase1T = clamp01(skillsT / 0.35);
    const phase2T = clamp01((skillsT - 0.35) / 0.40);
    const phase3T = clamp01((skillsT - 0.75) / 0.25);

    const skillGroups = skills.children;
    const halfCount = Math.ceil(skillGroups.length / 2);

    // Per-skill stagger: bottom of the V appears first, top last.
    const getStaggeredP = (index, globalP, maxDelay) => {
      const side = index < 6 ? 5 - index : 11 - (index - 6);
      const delay = (side / halfCount) * maxDelay;
      return clamp01((globalP - delay) / (1 - maxDelay));
    };

    // Smooth ease-out with subtle overshoot (back ease, not elastic).
    const easeOutBack = (x) => {
      const c = 1.4;
      return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
    };

    // --- Wobble: one continuous motion for the whole section ----------------
    // Y: 0.6 → 2 (phases 1+2) then 2 → 8 (phase 3), all smoothly joined.
    // Scale: 0.8 → 1 (phase 1) then held at 1.
    // WarpStrength: restore from 0.1 (left by Projects) back to normal.
    const wobbleP = easeInOut(skillsT); // 0→1 over entire section
    if (skillsT <= 0.75) {
      // Phases 1+2: dip down to -1.5 then rise to 2.
      const riseP = skillsT / 0.75;
      // Quadratic dip: goes negative first then rises smoothly.
      // At riseP=0 → 0.6, at riseP≈0.25 → -1.5 (lowest), at riseP=1 → 2.
      const dip = -1.5;
      const wobbleCurve = (1 - riseP) * (1 - riseP) * 0.6
        + 2 * (1 - riseP) * riseP * dip
        + riseP * riseP * 2;
      wobble.position.y = wobbleCurve;
    } else {
      // Phase 3: continue from 2 to 8.
      const exitP = easeOutCubic(phase3T);
      wobble.position.y = lerp(2, 8, exitP);
    }
    // Delay the scale-up: starts at 30% of phase 1, finishes at 100%.
    const scaleP = easeInOut(clamp01((phase1T - 0.3) / 0.7));
    wobble.scale.setScalar(lerp(0.8, 1, scaleP));
    wobble.rotation.y += 0.015 * (1 - wobbleP);
    // Restore warp that Projects section left at 0.1.
    uniforms.uWarpStrength.value = lerp(0.1, 1.8, clamp01(phase1T));

    // --- Skills sub-phase logic --------------------------------------------
    if (skillsT <= 0.35) {
      // Phase 1: staggered pop-in with gentle overshoot.
      const globalP = easeInOut(phase1T);

      skillGroups.forEach((sk, i) => {
        const init = sk.userData.initialPosition;
        const p = getStaggeredP(i, globalP, 0.35);
        const eased = easeOutBack(p);

        sk.position.x = init.x;
        sk.position.y = lerp(init.y - 3, init.y, eased);
        sk.position.z = init.z;

        const fadeP = clamp01(p * 2.5);
        sk.children.forEach((obj) => {
          if (obj.material) obj.material.opacity = fadeP;
        });
      });
    } else if (skillsT <= 0.75) {
      // Phase 2: hold V-formation, gentle lift.
      const p = easeInOut(phase2T);

      skillGroups.forEach((sk) => {
        const init = sk.userData.initialPosition;

        sk.position.x = init.x;
        sk.position.y = init.y + p * 0.4;
        sk.position.z = init.z;

        sk.children.forEach((obj) => {
          if (obj.material) obj.material.opacity = 1;
        });
      });
    } else {
      // Phase 3: sparks scatter outward and fade.
      const p = easeOutCubic(phase3T);
      camera.rotation.x = lerp(0.2, 0, p);

      skillGroups.forEach((sk, i) => {
        const init = sk.userData.initialPosition;
        const exitP = getStaggeredP(i, p, 0.2);

        sk.position.x = lerp(init.x, init.x * 2.5, exitP);
        sk.position.y = lerp(init.y + 0.4, init.y + 6, exitP);

        sk.children.forEach((obj) => {
          if (obj.material) obj.material.opacity = 1 - exitP;
        });
      });
    }
  }

  //-- Section 5 : Contact ----------------------------------------------------
  if (contactT > 0) {
    const pC = easeInOut(contactT);

    // Animate the wave plane to flip up like a wall behind the form.
    plane.position.y = lerp(-4, 0, pC);
    plane.position.z = lerp(1, 0, pC);
    plane.rotation.x = lerp(
      MathUtils.degToRad(90),
      MathUtils.degToRad(180),
      pC
    );

    // Calm down the noise frequency so the plane looks smoother.
    uniforms.uPositionFrequency.value = lerp(0.5, 0.2, pC);
    // And pull the camera slightly back.
    camera.position.z = lerp(0, -2, pC);
  }
};
