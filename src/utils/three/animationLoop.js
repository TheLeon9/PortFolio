//=============================================================================
// animationLoop — Clock, raycaster, mouse handlers, requestAnimationFrame
//
// The render loop owns three responsibilities:
//   1. Update the time uniform fed to the wobble shader.
//   2. Apply the camera parallax (smooth lerp toward the cursor position).
//   3. Auto-rotate the project rings, raycast them on mouse move and play
//      hover/click feedback (scale up + cursor scale).
//
// All `addEventListener` calls go through the resource tracker so they are
// removed automatically on cleanup.
//=============================================================================

//-- Imports ------------------------------------------------------------------
// Three.js core types: Clock, Raycaster, Vector2.
import { Clock, Raycaster, Vector2 } from 'three';

// GSAP is used for smooth scale tweens on hovered project rings and the
// cursor element.
import gsap from 'gsap';

// Per-section 3D animations driven by scrollProgress. Used to live in
// `Layout/index.js` as a giant useEffect; now called from inside the RAF
// loop so React is never on the hot path of a scroll.
import { runSectionAnimations } from './sectionAnimations';

//-- Constants ----------------------------------------------------------------

// How much the camera shifts horizontally/vertically per unit of cursor
// movement. Negative because we want the world to move opposite to the
// cursor (illusion of parallax depth).
const PARALLAX_AMPLITUDE = -0.1;

// Lerp factor for the parallax: 0.04 = slow, smooth follow. Higher values
// make the camera react faster but feel jittery.
const PARALLAX_EASE = 0.04;

// Per-frame rotation applied to the wobble sphere as a function of the
// cursor position — gives a subtle "looking at the user" effect.
const SPHERE_ROTATION_SPEED = 0.002;

// Per-frame Y rotation of every project ring. Small enough to feel ambient
// rather than spinning aggressively.
const BAND_AUTO_ROTATION = 0.002;

/**
 * startAnimationLoop
 * Wire up the mouse handlers and start the requestAnimationFrame loop.
 *
 * @param {Object} params
 * @param {Object} params.sceneState        - full sceneState built by initThreeScene
 * @param {Function} params.getScrollProgress - returns the current 0..100 scroll value
 * @param {Object} params.cursorRef         - React ref → custom cursor DOM node
 * @param {Function} params.addEventListenerTracked - tracker helper
 *
 * Returns an object with:
 *   • `getRequestId()` — current RAF id (for tests / debugging)
 *   • `cancel()`       — cancels the loop, used by `stopThreeScene`
 */
export const startAnimationLoop = ({
  sceneState,
  getScrollProgress,
  cursorRef,
  addEventListenerTracked,
}) => {
  // Pull the references the loop needs from the shared scene state. We
  // capture them once at startup; they are stable for the lifetime of the
  // scene (cleared by `stopThreeScene`).
  const camera = sceneState.camera;
  const cameraGroup = sceneState.cameraGroup;
  const composer = sceneState.composer;
  const sizes = sceneState.sizes;
  const uniforms = sceneState.uniforms;
  const wobble = sceneState.wobble;
  const projectsGroup = sceneState.projectsGroup;
  //-- Local state -----------------------------------------------------------

  // Three.js clock — `getElapsedTime()` returns the running time in seconds.
  const clock = new Clock();

  // Raycaster used to detect which project ring is under the cursor.
  const raycaster = new Raycaster();

  // Normalised mouse position fed to the raycaster (range [-1, 1]).
  const mouseVec = new Vector2();

  // Normalised mouse position used by the parallax (different state because
  // it is updated less aggressively).
  const mouse = { x: 0, y: 0 };

  // The currently-hovered ring, if any. Used to debounce the GSAP tweens so
  // we only animate on enter/leave, not every frame.
  let hoveredBand = null;

  // Set to true by mousemove and consumed by the next animate frame. Avoids
  // running the (relatively expensive) raycast every frame when the cursor
  // is idle.
  let needsRaycast = false;

  // Stored RAF id so cleanup can cancel the loop.
  let requestId = null;

  //-- Mouse handlers --------------------------------------------------------

  // Single mousemove handler — updates both the parallax coordinates and
  // the raycast vector, and flags the next frame for a raycast.
  const handleMouseMove = (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;
    mouseVec.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseVec.y = -(event.clientY / window.innerHeight) * 2 + 1;
    needsRaycast = true;
  };
  addEventListenerTracked(window, 'mousemove', handleMouseMove);

  // Click handler — runs a fresh raycast and opens the URL of the first
  // ring under the cursor in a new tab.
  const handlePointerDown = () => {
    if (!projectsGroup) return;
    const intersects = raycaster.intersectObjects(projectsGroup.children, true);
    if (intersects.length > 0) {
      const band = intersects[0].object;
      if (band.userData?.url) window.open(band.userData.url, '_blank');
    }
  };
  addEventListenerTracked(window, 'pointerdown', handlePointerDown);

  //-- Render loop -----------------------------------------------------------

  /**
   * animate
   * Single frame of the render loop. Reschedules itself via RAF at the end.
   */
  const animate = () => {
    // Drive the wobble shader with the elapsed time.
    const elapsedTime = clock.getElapsedTime();
    uniforms.uTime.value = elapsedTime;

    // -- Per-section 3D animations (read scroll directly, no React) -------
    // Read the current scroll value from the proxy ref. This used to live
    // in a Layout useEffect that ran ~30×/sec; now it runs at the full RAF
    // cadence (60/120/144 Hz) without ever waking up React.
    const scrollProgress = getScrollProgress();
    runSectionAnimations(scrollProgress, sceneState);

    // -- Camera parallax (smooth follow) ----------------------------------
    // Compute the desired offset and lerp toward it. The lerp gives the
    // smooth, "weighted" feel instead of an instant snap.
    const parallaxX = mouse.x * PARALLAX_AMPLITUDE;
    const parallaxY = mouse.y * PARALLAX_AMPLITUDE;
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * PARALLAX_EASE;
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * PARALLAX_EASE;

    // -- Project rings: auto-rotate + hover -------------------------------
    if (projectsGroup) {
      // Apply the constant ambient rotation to every ring.
      projectsGroup.children.forEach((band) => {
        band.rotation.y += BAND_AUTO_ROTATION;
      });

      // Only raycast when the mouse actually moved this frame.
      if (needsRaycast) {
        needsRaycast = false;
        raycaster.setFromCamera(mouseVec, camera);
        const intersects = raycaster.intersectObjects(projectsGroup.children, true);
        const cursor = cursorRef?.current;

        if (intersects.length > 0) {
          // The cursor entered a ring (or moved between rings).
          const band = intersects[0].object;
          if (hoveredBand !== band) {
            // Reset the previously hovered ring back to scale 1.
            if (hoveredBand) {
              gsap.to(hoveredBand.scale, {
                x: 1, y: 1, z: 1, duration: 0.3, ease: 'power2.out',
              });
            }
            // Remember the new one and animate it up to scale 1.1.
            hoveredBand = band;
            gsap.to(band.scale, {
              x: 1.1, y: 1.1, z: 1.1, duration: 0.3, ease: 'power2.out',
            });
            // Also enlarge the custom cursor as a hover feedback.
            if (cursor) gsap.to(cursor, { scale: 2, duration: 0.25, ease: 'power2.out' });
          }
        } else if (hoveredBand) {
          // Cursor left every ring — animate the previously hovered ring
          // and the cursor back to their resting scale.
          gsap.to(hoveredBand.scale, {
            x: 1, y: 1, z: 1, duration: 0.3, ease: 'power2.out',
          });
          hoveredBand = null;
          if (cursor) gsap.to(cursor, { scale: 1, duration: 0.25, ease: 'power2.out' });
        }
      }
    }

    // -- Subtle "look at cursor" rotation of the wobble sphere ------------
    if (wobble) {
      // Note: rotations are accumulated each frame (not set absolutely), so
      // they keep their state between frames and feel like inertia.
      wobble.rotation.x += -mouse.y * SPHERE_ROTATION_SPEED;
      wobble.rotation.y += mouse.x * SPHERE_ROTATION_SPEED;
    }

    // Render the scene through the composer (so post-processing kicks in).
    composer.render();

    // Reschedule next frame.
    requestId = requestAnimationFrame(animate);
  };

  // Kick off the loop immediately.
  animate();

  return {
    getRequestId: () => requestId,
    cancel: () => {
      if (requestId) {
        cancelAnimationFrame(requestId);
        requestId = null;
      }
    },
  };
};
