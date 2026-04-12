//=============================================================================
// debugGUI — lil-gui debug panel (activated via #debug in the URL)
//
// When the user appends `#debug` to the URL the Layout calls `initDebugGUI`,
// which calls `buildDebugGUI` from this module. The panel exposes:
//   • the wobble shader uniforms (frequency / strength / warp)
//   • the material transmission slider
//   • two colour pickers (mainColor + secondColor) wired to the same
//     refresh helpers used by the React ColorPicker component
//
// State (`_gui`, `_debugObject`, `_setMainColor`) is module-level so the
// `syncDebugDisplayValues` and `destroyDebugGUI` helpers can access it from
// outside the build closure.
//=============================================================================

//-- Imports ------------------------------------------------------------------
// lil-gui is loaded dynamically to keep it out of the production bundle.
// It is only needed when the user activates debug mode via #debug in the URL.

//-- Module-level state -------------------------------------------------------

// The current GUI instance, or null when no panel is active.
let _gui = null;

// Plain JS object whose keys are bound to GUI controllers. Modifying a key
// updates the corresponding controller and vice versa.
let _debugObject = null;

// Optional setter from the ThemeContext, used to push manual colour edits
// back into React state when the user releases the slider.
let _setMainColor = null;

/**
 * buildDebugGUI
 * Construct the lil-gui panel from the active scene state.
 *
 * @param {Object} params
 * @param {Object} params.state             - sceneState built by initThreeScene
 * @param {Function} params.setMainColor    - optional React setter
 * @param {Function} params.refreshAllTextures - callback to repaint canvas textures
 */
export const buildDebugGUI = async ({ state, setMainColor, refreshAllTextures }) => {
  // Bail out if the scene is not ready yet or if the panel is already built.
  if (!state?.uniforms || !state?.material || _gui) return;

  const { default: GUI } = await import('lil-gui');

  _setMainColor = setMainColor || null;
  // Mirror the current colours into a plain object the GUI can mutate.
  _debugObject = {
    mainColor: state.mainColor,
    secondColor: state.backgroundColor,
  };
  // Stash the same object on the scene state so other modules (like the
  // refresh helpers) can read the manually-overridden values.
  state.debugObject = _debugObject;

  // Create the GUI shell.
  _gui = new GUI({ width: 325 });

  // Folder structure groups related controls together for clarity.
  const folderUniforms = _gui.addFolder('Uniforms');
  const folderWrapUniforms = _gui.addFolder('Wrap Uniforms');
  const folderMaterial = _gui.addFolder('Material');
  const folderColors = _gui.addFolder('Colors');

  //-- Wobble shader uniforms (main noise) ----------------------------------
  folderUniforms
    .add(state.uniforms.uPositionFrequency, 'value', 0, 1, 0.001)
    .name('uPositionFrequency');
  folderUniforms
    .add(state.uniforms.uTimeFrequency, 'value', 0, 1, 0.001)
    .name('uTimeFrequency');
  folderUniforms
    .add(state.uniforms.uStrength, 'value', 0, 0.8, 0.001)
    .name('uStrength');

  //-- Wobble shader uniforms (warp/secondary noise) ------------------------
  folderWrapUniforms
    .add(state.uniforms.uWarpPositionFrequency, 'value', 0, 0.5, 0.001)
    .name('uWarpPositionFrequency');
  folderWrapUniforms
    .add(state.uniforms.uWarpTimeFrequency, 'value', 0, 1, 0.001)
    .name('uWarpTimeFrequency');
  folderWrapUniforms
    .add(state.uniforms.uWarpStrength, 'value', 0, 1.8, 0.001)
    .name('uWarpStrength');

  //-- Material transmission ------------------------------------------------
  folderMaterial.add(state.material, 'transmission', 0, 1, 0.001);

  //-- Color pickers --------------------------------------------------------
  folderColors
    .addColor(_debugObject, 'mainColor')
    // `onChange` fires continuously while the user drags. We update the
    // GPU values immediately to give live feedback, but defer the React/
    // canvas regeneration to `onFinishChange` because canvas regeneration
    // is too expensive to run at 60fps.
    .onChange(() => {
      const color = _debugObject.mainColor;

      // Direct GPU updates — no React re-render.
      state.uniforms.uMainColor.value.set(color);
      if (state.radialMaterial) {
        state.radialMaterial.uniforms.colorInt.value.set(color);
        state.radialMaterial.uniforms.colorExt.value.set(color);
      }
      // Walk the text group to update the side faces of every letter.
      state.textGroup?.traverse((child) => {
        if (child.isMesh && Array.isArray(child.material)) {
          child.material[1].color.set(color);
        }
      });
      // Push the new colour into the global CSS variable so the rest of
      // the page (UI elements, scrollbar, etc.) follows.
      document.documentElement.style.setProperty('--color-primary', color);
    })
    // `onFinishChange` fires once when the user releases the slider —
    // expensive work happens here.
    .onFinishChange(() => {
      const color = _debugObject.mainColor;
      const bgColor = _debugObject.secondColor;

      // Repaint every canvas texture (About / Projects / Skills) and sync
      // the React state via the optional setter.
      refreshAllTextures(color, bgColor);
      if (_setMainColor) _setMainColor(color);
    });

  // Second colour picker — flag the manual override so the React effect
  // does not overwrite it on the next render.
  folderColors
    .addColor(_debugObject, 'secondColor')
    .onChange(() => {
      state.secondColorManual = true;
      state.uniforms.uSecondColor.value.set(_debugObject.secondColor);
    });
};

/**
 * syncDebugDisplayValues
 * When the colours change from outside (React ColorPicker), push the new
 * values into the GUI sliders so the panel stays in sync.
 */
export const syncDebugDisplayValues = ({ state, mainColor, backgroundColor }) => {
  // No-op if the GUI is not active.
  if (!_gui || !_debugObject) return;
  _debugObject.mainColor = mainColor;
  // Only update secondColor if the user did NOT override it manually.
  if (!state?.secondColorManual) {
    _debugObject.secondColor = backgroundColor;
  }
  // Force every controller to re-read its bound value.
  _gui.controllersRecursive().forEach((c) => c.updateDisplay());
};

/**
 * destroyDebugGUI
 * Tear the GUI down and reset module-level state. Called by `stopThreeScene`
 * during component unmount.
 */
export const destroyDebugGUI = () => {
  if (_gui) {
    _gui.destroy();
    _gui = null;
  }
  _debugObject = null;
  _setMainColor = null;
};
