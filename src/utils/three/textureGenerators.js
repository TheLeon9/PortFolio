//=============================================================================
// textureGenerators — Canvas → CanvasTexture factories (About / Projects / Skills)
//
// All three "text on glass" elements of the scene (About fragments, Project
// rings and Skill labels) ultimately rely on a 2D canvas where we paint text
// with strokes and shadows, then wrap it as a Three.js `CanvasTexture`.
// Before this module the same boilerplate (createCanvas + clear + style +
// dispose-friendly settings) lived three times in `initThreeScene.js`. This
// file factorises everything into shared helpers + three thin factories.
//=============================================================================

//-- Imports ------------------------------------------------------------------
// Three.js gives us `CanvasTexture` and the texture filter constants.
import {
  CanvasTexture,
  LinearMipMapLinearFilter,
  LinearFilter,
} from 'three';

// We import the brand colours so the contrast computation (see
// `pickStrokeColor`) does not depend on hard-coded hex values.
import {
  DEFAULT_BLACK_COLOR,
  DEFAULT_BACKGROUND_COLOR,
} from '@/constants';

//-- Constants ----------------------------------------------------------------

// Single source of truth for the font stack used on every canvas. Keeping it
// here lets us tweak the family in one place without hunting through three
// generators.
const FONT_FAMILY = 'Orbitron, sans-serif';

//-- Internal helpers ---------------------------------------------------------

/**
 * pickStrokeColor
 * Returns the stroke colour that will read best behind the current text:
 * if the user picked the white background we stroke in black, otherwise we
 * stroke in white. This guarantees the text remains legible even after the
 * ColorPicker swaps the global theme.
 */
const pickStrokeColor = (textColor) =>
  textColor.toLowerCase() === DEFAULT_BACKGROUND_COLOR
    ? DEFAULT_BLACK_COLOR
    : DEFAULT_BACKGROUND_COLOR;

/**
 * createCanvas
 * Tiny wrapper that builds an offscreen <canvas> at the requested size.
 * Inlined for clarity — we never want to forget setting both width AND
 * height (forgetting one resets the other to the default 300x150).
 */
const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

/**
 * canvasToTexture
 * Wraps a finished canvas in a Three.js CanvasTexture, sets sane filtering
 * defaults (anisotropy 16 + linear/mipmap so the text stays crisp at any
 * angle), pushes the texture into the resource tracker, and returns it.
 */
const canvasToTexture = (canvas, trackTexture) => {
  const tex = trackTexture(new CanvasTexture(canvas));
  // High anisotropy = sharp text when the surface is viewed at a steep angle
  // (matters for the rotating Project rings).
  tex.anisotropy = 16;
  // Tell Three.js the canvas pixels are fresh and need to be uploaded.
  tex.needsUpdate = true;
  // Trilinear filtering avoids the moiré pattern when the texture shrinks.
  tex.minFilter = LinearMipMapLinearFilter;
  tex.magFilter = LinearFilter;
  return tex;
};

//-- Public factories ---------------------------------------------------------

/**
 * createAboutTextureFactory
 * Returns a function `(text, bg, textColor) → CanvasTexture` that paints a
 * single big centred line of text on a coloured background. Used by the five
 * glass fragments of the About section (lastname, firstname, age, location,
 * description).
 *
 * @param {Function} trackTexture - resource tracker passed by `initThreeScene`
 */
export const createAboutTextureFactory = (trackTexture) =>
  (text, colorBg, textColor) => {
    // Canvas is wide & flat to match the BoxGeometry aspect of the fragments.
    const sizeX = 1024;
    const sizeY = 256;
    const canvas = createCanvas(sizeX, sizeY);
    const ctx = canvas.getContext('2d');

    // Always start from a clean slate (paranoia — canvas is brand new but
    // some browsers do not zero-init reliably).
    ctx.clearRect(0, 0, sizeX, sizeY);

    // Background fill (the colour comes from the ColorPicker).
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, sizeX, sizeY);

    // Text style — centred horizontally & vertically, glow via shadowBlur.
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 40;
    ctx.font = `bold 60px ${FONT_FAMILY}`;
    ctx.lineWidth = 2;
    // Stroke colour adapts so the text reads against any theme.
    ctx.strokeStyle = pickStrokeColor(textColor);

    // Draw the stroke first then the fill so the outline sits behind.
    ctx.strokeText(text, sizeX / 2, sizeY / 2);
    ctx.fillStyle = textColor;
    ctx.fillText(text, sizeX / 2, sizeY / 2);

    return canvasToTexture(canvas, trackTexture);
  };

/**
 * createProjectTextureFactory
 * Returns a function that paints the texture of a single Project ring:
 *   • a centred title at the bottom
 *   • up to 5 right-aligned highlights underneath the title
 *   • a wrapped paragraph description on the left
 *
 * The canvas is twice as tall as the About one because there is much more
 * vertical content to fit.
 */
export const createProjectTextureFactory = (trackTexture) =>
  (title, description, highlights = [], colorBg, textColor) => {
    const sizeX = 1024;
    const sizeY = 512;
    const canvas = createCanvas(sizeX, sizeY);
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, sizeX, sizeY);

    // --- Background --------------------------------------------------------
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, sizeX, sizeY);

    // --- Shared text styles ------------------------------------------------
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 40;

    // --- Title (centred, bottom of the canvas) -----------------------------
    ctx.font = `bold 42px ${FONT_FAMILY}`;
    ctx.lineWidth = 2;
    ctx.strokeStyle = pickStrokeColor(textColor);

    // Title sits 120 px from the bottom — leaves room for highlights below.
    const titleY = sizeY - 120;
    ctx.strokeText(title, sizeX / 2, titleY);
    ctx.fillStyle = textColor;
    ctx.fillText(title, sizeX / 2, titleY);

    // --- Highlights (small text, right aligned, stacked) -------------------
    ctx.font = `12px ${FONT_FAMILY}`;
    ctx.fillStyle = textColor;
    ctx.shadowBlur = 20;
    ctx.textAlign = 'right';
    ctx.lineWidth = 0.5; // thinner stroke matches the smaller font
    ctx.strokeStyle = pickStrokeColor(textColor);

    // Anchor a bit to the right of centre so the column does not overlap
    // the centred title.
    const highlightStartX = sizeX / 2 + 190;
    let highlightStartY = titleY + 30; // first highlight sits below title
    const lineHeight = 16;             // tight vertical spacing

    highlights.forEach((highlight) => {
      ctx.strokeText(highlight, highlightStartX, highlightStartY);
      ctx.fillText(highlight, highlightStartX, highlightStartY);
      highlightStartY += lineHeight;
    });

    // --- Description (left aligned, with manual line wrapping) -------------
    if (description) {
      ctx.font = `12px ${FONT_FAMILY}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'left';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = pickStrokeColor(textColor);

      // Editable layout knobs for the description block.
      const descStartX = 20;       // left margin
      const descStartY = titleY - 20; // start just above the title baseline
      const descLineHeight = 20;   // vertical spacing between wrapped lines
      const descMaxWidth = 300;    // hard wrap width in pixels

      // Greedy word-wrap: append words to `line` until it would exceed
      // descMaxWidth, then flush and continue on the next line.
      const words = description.split(' ');
      let line = '';
      let y = descStartY;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > descMaxWidth && i > 0) {
          // Current line is full — paint it and start a new one.
          ctx.strokeText(line, descStartX, y);
          ctx.fillText(line, descStartX, y);
          line = words[i] + ' ';
          y += descLineHeight;
        } else {
          // Still room — keep accumulating words on the same line.
          line = testLine;
        }
      }

      // Don't forget to paint the last line outside the loop.
      ctx.strokeText(line, descStartX, y);
      ctx.fillText(line, descStartX, y);
    }

    return canvasToTexture(canvas, trackTexture);
  };

/**
 * createSkillLabelTextureFactory
 * Returns a function that paints a single skill label as a transparent
 * sprite (no background fill, only glowing text). Used by the 12 sparks
 * of the Skills section.
 */
export const createSkillLabelTextureFactory = (trackTexture) =>
  (text, color, textColor) => {
    // Same width as the other generators so the sprites stay sharp.
    const width = 1024;
    const height = 256;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // No background fill: keep the canvas fully transparent so the sprite
    // shows only the text.
    ctx.clearRect(0, 0, width, height);

    // Tiny font: sprites are zoomed down a lot in the scene, so anything
    // larger would look blurry after mipmapping.
    ctx.font = `bold 12px ${FONT_FAMILY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 20;       // soft glow around the text
    ctx.lineWidth = 0.5;       // very thin contrast stroke
    ctx.strokeStyle = pickStrokeColor(textColor);

    const centerX = width / 2;
    const centerY = height / 2;

    ctx.strokeText(text, centerX, centerY);
    ctx.fillStyle = color;
    ctx.fillText(text, centerX, centerY);

    return canvasToTexture(canvas, trackTexture);
  };
