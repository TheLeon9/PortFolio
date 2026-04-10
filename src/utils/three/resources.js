//=============================================================================
// resources — Three.js resource tracker for clean teardown
//
// Three.js does not garbage-collect WebGL resources automatically: every
// geometry, material, texture and DOM event listener allocated during the
// scene init must be disposed manually when the React component unmounts.
// This module exposes a tiny tracker that wraps each allocation, stores a
// reference, and exposes a single `disposeAll()` to release everything in
// the right order at cleanup time.
//=============================================================================

//-- Imports ------------------------------------------------------------------
// (No imports — pure JS, decoupled from Three so it stays trivially testable.)

//-- Constants ----------------------------------------------------------------
// (None — the tracker is fully dynamic.)

/**
 * createResourceTracker
 * Factory that returns an isolated tracker. Calling it twice gives two
 * independent buckets — useful if we ever want to swap scenes at runtime
 * without leaking resources from the previous one.
 *
 * @returns {{
 *   resources: { geometries, materials, textures, eventListeners },
 *   trackGeometry, trackMaterial, trackTexture,
 *   addEventListenerTracked, disposeAll
 * }}
 */
export const createResourceTracker = () => {
  //-- Internal buckets -------------------------------------------------------
  // Each array stores raw references to objects we created during init.
  // We never iterate them at render time, only at cleanup time, so push()
  // is fine and the tracker has zero hot-path cost.
  const resources = {
    geometries: [],     // BufferGeometry / IcosahedronGeometry / LatheGeometry / ...
    materials: [],      // MeshPhysicalMaterial / ShaderMaterial / SpriteMaterial / ...
    textures: [],       // CanvasTexture instances built from <canvas> elements
    eventListeners: [], // { target, event, handler, options } records
  };

  //-- Tracking helpers -------------------------------------------------------
  // Each helper is a "tap": pass through the object so it can be used inline
  // (e.g. `const geo = trackGeometry(new THREE.BoxGeometry(...))`).

  /** Register a geometry for later disposal and return it unchanged. */
  const trackGeometry = (geo) => {
    resources.geometries.push(geo);
    return geo;
  };

  /** Register a material for later disposal and return it unchanged. */
  const trackMaterial = (mat) => {
    resources.materials.push(mat);
    return mat;
  };

  /** Register a texture for later disposal and return it unchanged. */
  const trackTexture = (tex) => {
    resources.textures.push(tex);
    return tex;
  };

  /**
   * Wrapper around `target.addEventListener` that also stores the handler
   * tuple, so the matching `removeEventListener` can be issued at cleanup
   * time without having to keep separate references in the caller.
   */
  const addEventListenerTracked = (target, event, handler, options) => {
    target.addEventListener(event, handler, options);
    resources.eventListeners.push({ target, event, handler, options });
  };

  //-- Cleanup ----------------------------------------------------------------
  /**
   * disposeAll
   * Tears down every tracked resource in a safe order:
   *   1. detach event listeners (so no further callbacks run)
   *   2. dispose textures, materials, geometries
   *   3. dispose post-processing composer (if any)
   *   4. dispose the WebGL renderer and force a context loss (frees the
   *      underlying GPU memory immediately on Chrome/Firefox)
   *   5. traverse the scene graph one last time to catch anything we missed
   *      (e.g. objects added by sub-modules without going through the
   *      tracker), and finally clear the scene
   *   6. zero-length the buckets so the tracker can be reused
   *
   * @param {Object} [opts]
   * @param {THREE.Scene} [opts.scene]
   * @param {THREE.WebGLRenderer} [opts.renderer]
   * @param {EffectComposer} [opts.composer]
   */
  const disposeAll = ({ scene, renderer, composer } = {}) => {
    // 1) Detach DOM listeners first to make sure no callback fires while
    //    we are tearing down the GPU resources they may reference.
    resources.eventListeners.forEach(({ target, event, handler, options }) => {
      target.removeEventListener(event, handler, options);
    });

    // 2) Dispose CPU/GPU resources in reverse order of creation:
    //    textures depend on canvases, materials reference textures,
    //    geometries are independent.
    resources.textures.forEach((t) => {
      // Release the backing canvas element so it can be garbage-collected.
      // CanvasTexture stores the canvas in `.image`; without this, repeated
      // colour changes accumulate orphaned canvases in memory.
      if (t?.image instanceof HTMLCanvasElement) {
        t.image.width = 0;
        t.image.height = 0;
        t.image = null;
      }
      t?.dispose?.();
    });
    resources.materials.forEach((m) => m?.dispose?.());
    resources.geometries.forEach((g) => g?.dispose?.());

    // 3) Post-processing composer holds extra render targets — release them.
    if (composer) composer.dispose();

    // 4) Renderer last: forceContextLoss() asks the browser to drop the
    //    WebGL context immediately instead of waiting for GC.
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
    }

    // 5) Traverse the scene to catch any object that escaped the tracker
    //    (sub-modules sometimes attach extra meshes via add()).
    if (scene) {
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      // Detach every child from the scene root.
      scene.clear();
    }

    // 6) Reset the buckets so the tracker is reusable.
    resources.geometries.length = 0;
    resources.materials.length = 0;
    resources.textures.length = 0;
    resources.eventListeners.length = 0;
  };

  // Expose only the API the rest of the codebase needs.
  return {
    resources,
    trackGeometry,
    trackMaterial,
    trackTexture,
    addEventListenerTracked,
    disposeAll,
  };
};
