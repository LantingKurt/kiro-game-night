const Aseprite = require('ase-parser');
const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

const inputPath = path.resolve('sprites/maincharacter.aseprite');
const buf = fs.readFileSync(inputPath);
const ase = new Aseprite(buf, 'maincharacter');
ase.parse();

console.log(`Parsed: ${ase.width}x${ase.height}, ${ase.frames.length} frames, ${ase.layers.length} layers`);

const EXCLUDED_LAYERS = new Set(['bg', 'guide']);
const visibleLayerIndices = new Set();
ase.layers.forEach((layer, idx) => {
  if (layer.flags && layer.flags.visible && !EXCLUDED_LAYERS.has(layer.name)) {
    visibleLayerIndices.add(idx);
  }
});

function renderFrame(frameIdx) {
  const frame = ase.frames[frameIdx];
  const pixels = Buffer.alloc(ase.width * ase.height * 4);

  for (const cel of frame.cels) {
    if (!visibleLayerIndices.has(cel.layerIndex)) continue;
    if (!cel.rawCelData || cel.rawCelData.length === 0) continue;

    for (let y = 0; y < cel.h; y++) {
      for (let x = 0; x < cel.w; x++) {
        const srcIdx = (y * cel.w + x) * 4;
        const dstX = cel.xpos + x;
        const dstY = cel.ypos + y;
        if (dstX < 0 || dstX >= ase.width || dstY < 0 || dstY >= ase.height) continue;

        const alpha = cel.rawCelData[srcIdx + 3];
        if (alpha === 0) continue;

        const dstIdx = (dstY * ase.width + dstX) * 4;

        if (alpha === 255) {
          pixels[dstIdx] = cel.rawCelData[srcIdx];
          pixels[dstIdx + 1] = cel.rawCelData[srcIdx + 1];
          pixels[dstIdx + 2] = cel.rawCelData[srcIdx + 2];
          pixels[dstIdx + 3] = 255;
        } else {
          const srcA = alpha / 255;
          const dstA = pixels[dstIdx + 3] / 255;
          const outA = srcA + dstA * (1 - srcA);
          if (outA > 0) {
            pixels[dstIdx] = Math.round((cel.rawCelData[srcIdx] * srcA + pixels[dstIdx] * dstA * (1 - srcA)) / outA);
            pixels[dstIdx + 1] = Math.round((cel.rawCelData[srcIdx + 1] * srcA + pixels[dstIdx + 1] * dstA * (1 - srcA)) / outA);
            pixels[dstIdx + 2] = Math.round((cel.rawCelData[srcIdx + 2] * srcA + pixels[dstIdx + 2] * dstA * (1 - srcA)) / outA);
            pixels[dstIdx + 3] = Math.round(outA * 255);
          }
        }
      }
    }
  }
  return pixels;
}

function exportSheet(name, from, to) {
  const frameCount = to - from + 1;
  const sheetWidth = ase.width * frameCount;
  const png = new PNG({ width: sheetWidth, height: ase.height });
  png.data = Buffer.alloc(sheetWidth * ase.height * 4);

  for (let f = from; f <= to; f++) {
    const pixels = renderFrame(f);
    const col = f - from;
    for (let y = 0; y < ase.height; y++) {
      for (let x = 0; x < ase.width; x++) {
        const srcIdx = (y * ase.width + x) * 4;
        const dstIdx = (y * sheetWidth + col * ase.width + x) * 4;
        pixels.copy(png.data, dstIdx, srcIdx, srcIdx + 4);
      }
    }
  }

  const outPath = path.resolve(`sprites/maincharacter-${name}.png`);
  fs.writeFileSync(outPath, PNG.sync.write(png));
  console.log(`  ${name}: ${frameCount} frames -> ${outPath} (${sheetWidth}x${ase.height})`);
}

const animations = {
  'idle-s':  { from: 0,  to: 3  },
  'idle-se': { from: 4,  to: 7  },
  'idle-ne': { from: 8,  to: 11 },
  'idle-n':  { from: 12, to: 15 },
  'run-s':   { from: 60, to: 67 },
  'run-se':  { from: 68, to: 75 },
  'run-ne':  { from: 76, to: 83 },
  'run-n':   { from: 84, to: 91 },
};

console.log('Exporting directional sprites:');
for (const [name, { from, to }] of Object.entries(animations)) {
  exportSheet(name, from, to);
}

console.log('Done!');
