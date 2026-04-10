//=============================================================================
// materials — Shared uniforms and Wobble / Radial materials
//
// All the "alive" surfaces of the scene (the central wobble sphere, the wave
// plane that flips up during the Contact section, and the radial gradient
// background) share the same set of GLSL uniforms and the same custom
// shader. This file owns the construction of those uniforms and materials so
// every consumer (`wobbleSphere.js`, `initThreeScene.js`, `debugGUI.js`)
// pulls from a single source of truth.
//=============================================================================

//-- Imports ------------------------------------------------------------------
// Core Three.js types: Uniform, Color, MeshPhysicalMaterial, ShaderMaterial.
import {
  Uniform,
  Color,
  MeshPhysicalMaterial,
  MeshDepthMaterial,
  ShaderMaterial,
  RGBADepthPacking,
} from 'three';

// `three-custom-shader-material` lets us inject our own vertex/fragment GLSL
// while inheriting all the PBR features of MeshPhysicalMaterial (transmission,
// IOR, clearcoat...). Without it we would have to reimplement the lighting.
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';

// Compiled GLSL shaders (loaded as raw strings via webpack — see next.config).
import wobbleVertexShader from '../shaders/wobble/vertex.glsl';
import wobbleFragmentShader from '../shaders/wobble/fragment.glsl';

//-- Constants ----------------------------------------------------------------
// (None — every value is data-driven so the ColorPicker / debug GUI can
// override them at runtime.)

/**
 * createUniforms
 * Build the uniform block consumed by both the wobble sphere and the wave
 * plane. The names match the GLSL declarations in `vertex.glsl` /
 * `fragment.glsl`. Default values were tuned by hand for a balanced look.
 *
 * @param {Object} params
 * @param {string} params.mainColor    - hex string for the primary colour
 * @param {string} params.secondColor  - hex string for the background colour
 */
export const createUniforms = ({ mainColor, secondColor }) => ({
  // Time accumulator updated every frame in `animationLoop.js`.
  uTime: new Uniform(0),

  // Spatial frequency of the noise that distorts the surface — higher means
  // more bumps per unit length.
  uPositionFrequency: new Uniform(0.5),

  // Temporal frequency: how fast the noise pattern evolves over time.
  uTimeFrequency: new Uniform(0.4),

  // Amplitude of the displacement (how far each vertex is pushed).
  uStrength: new Uniform(0.3),

  // Secondary "warp" noise that distorts the input of the main noise so the
  // result feels organic instead of regular.
  uWarpPositionFrequency: new Uniform(0.4),
  uWarpTimeFrequency: new Uniform(0.1),
  uWarpStrength: new Uniform(1.8),

  // Two colours mixed together by the fragment shader (the gradient is
  // driven by the noise value, giving the iridescent look).
  uMainColor: new Uniform(new Color(mainColor)),
  uSecondColor: new Uniform(new Color(secondColor)),
});

/**
 * createWobbleMaterial
 * Build the main physical material for the wobble sphere and the wave plane.
 * MeshPhysicalMaterial gives us transmission (glass-like refraction) and a
 * realistic IOR while the custom GLSL handles the surface displacement.
 */
export const createWobbleMaterial = ({ uniforms, transmissionLevel, trackMaterial }) =>
  trackMaterial(new CustomShaderMaterial({
    // Inherit from physical material so we keep PBR features for free.
    baseMaterial: MeshPhysicalMaterial,
    vertexShader: wobbleVertexShader,
    fragmentShader: wobbleFragmentShader,
    silent: true, // suppress the "uniforms unused" warnings during HMR

    // Shared uniforms — same object reference is mutated every frame.
    uniforms,

    // -- PBR knobs (tuned by eye) -------------------------------------------
    metalness: 0,
    roughness: 0.5,                  // half-glossy half-rough surface
    color: '#ffffff',                // base albedo (modulated by the shader)
    transmission: transmissionLevel, // 0 = opaque, 1 = fully transparent
    ior: 1.5,                        // 1.5 ≈ window glass
    thickness: 1.5,                  // virtual depth used by transmission
    transparent: true,
    wireframe: false,
  }));

/**
 * createDepthMaterial
 * Custom depth material so the wobble sphere casts correct shadows even
 * though its real geometry is displaced by the vertex shader. Without this,
 * Three.js would compute shadows from the undisplaced sphere and we'd see a
 * round shadow next to a deformed sphere.
 */
export const createDepthMaterial = ({ uniforms, trackMaterial }) =>
  trackMaterial(new CustomShaderMaterial({
    baseMaterial: MeshDepthMaterial,
    vertexShader: wobbleVertexShader,
    silent: true,
    uniforms,
    // RGBA packing is required to store the high-precision depth in a
    // standard 8-bit RGBA shadow map.
    depthPacking: RGBADepthPacking,
  }));

/**
 * createRadialMaterial
 * Builds the ShaderMaterial of the full-screen radial gradient drawn behind
 * the scene. Two colours (`colorInt` at the centre, `colorExt` at the edges)
 * are linearly interpolated using the distance from the centre, with an
 * aspect-ratio correction so the gradient stays a perfect circle on any
 * viewport.
 */
export const createRadialMaterial = ({ mainColor, trackMaterial }) =>
  trackMaterial(new ShaderMaterial({
    uniforms: {
      // Both colours start at the same value: the gradient is invisible by
      // default and becomes visible only when the debug GUI tweaks them.
      colorInt: { value: new Color(mainColor) },
      colorExt: { value: new Color(mainColor) },
      // Viewport aspect ratio used to correct the gradient circle.
      ratio: { value: window.innerWidth / window.innerHeight },
    },
    transparent: true,

    // Vertex shader: render in clip-space directly so the plane covers the
    // whole viewport regardless of camera position.
    vertexShader: `varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = vec4(position, 1.);
      }`,

    // Fragment shader: distance from the centre → linear mix between
    // colorInt and colorExt, with a fixed 0.4 alpha so the scene shows
    // through.
    fragmentShader: `varying vec2 vUv;
      uniform vec3 colorInt;
      uniform vec3 colorExt;
      uniform float ratio;
      void main(){
        vec2 uv = (vUv - 0.5) * vec2(ratio, 1.);
        gl_FragColor = vec4( mix( colorInt, colorExt, length(uv)), .4);
      }`,
  }));
