//=============================================================================
// postProcessing — EffectComposer + UnrealBloomPass setup
//
// The scene is rendered through an EffectComposer instead of the renderer
// directly, so we can stack passes. Today we only stack one effect: bloom.
// The bloom adds the glowing halo around the wobble sphere and the skill
// sparks. Parameters are tuned per-platform so phones do not melt under
// the cost of the high-res bloom blur.
//=============================================================================

//-- Imports ------------------------------------------------------------------
// EffectComposer drives a chain of post-processing passes; RenderPass renders
// the scene as the first pass; UnrealBloomPass produces the bloom glow.
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

//-- Constants ----------------------------------------------------------------
// (None — bloom values are tweaked per device inline below.)

/**
 * createPostProcessing
 * Build the composer, add a RenderPass + an UnrealBloomPass and return the
 * composer so the animation loop can call `composer.render()` instead of
 * `renderer.render()`.
 *
 * @param {Object} params
 * @param {THREE.WebGLRenderer} params.renderer
 * @param {THREE.Scene} params.scene
 * @param {THREE.PerspectiveCamera} params.camera
 * @param {boolean} params.isMobile - tweak the bloom intensity on mobile
 */
export const createPostProcessing = ({ renderer, scene, camera, isMobile }) => {
  // Composer drives the chain of passes.
  const composer = new EffectComposer(renderer);

  // Pass 1: render the actual scene into the composer's framebuffer.
  composer.addPass(new RenderPass(scene, camera));

  // Pass 2: bloom (glow) on bright pixels.
  const bloomPass = new UnrealBloomPass();
  if (isMobile) {
    // Mobile: keep the bloom subtle and the blur radius small to avoid
    // tanking the framerate.
    bloomPass.strength = 0.05;
    bloomPass.radius = 0.5;
    bloomPass.threshold = 0.2;
  } else {
    // Desktop: stronger glow with a larger blur radius for the cinematic
    // look.
    bloomPass.strength = 0.1;
    bloomPass.radius = 0.9;
    bloomPass.threshold = 0.12;
  }
  composer.addPass(bloomPass);

  return { composer };
};
