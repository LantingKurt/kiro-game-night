import { WORLD_W, WORLD_H } from './camera.js';

const BLOCK = 24;

// ── Wall shape templates ────────────────────────────────────────────
const WALL_SHAPES = [
  { cells: Array.from({length:12}, (_,i) => [i,0]) },
  { cells: Array.from({length:10}, (_,i) => [i,0]) },
  { cells: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[1,5],[2,5],[3,5],[4,5]] },
  { cells: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[3,1],[3,2],[3,3]] },
  { cells: [[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[2,2],[2,1],[2,0]] },
];

function rotateShape(cells, times) {
  let rotated = cells.map(c => [...c]);
  for (let r = 0; r < times; r++) {
    rotated = rotated.map(([x, y]) => [-y, x]);
    const minX = Math.min(...rotated.map(c => c[0]));
    const minY = Math.min(...rotated.map(c => c[1]));
    rotated = rotated.map(([x, y]) => [x - minX, y - minY]);
  }
  return rotated;
}

function shapeBounds(cells) {
  const maxX = Math.max(...cells.map(c => c[0]));
  const maxY = Math.max(...cells.map(c => c[1]));
  return { w: (maxX + 1) * BLOCK, h: (maxY + 1) * BLOCK };
}

// ── Placement helpers ───────────────────────────────────────────────
function tooCloseToSpawn(x, y, w, h, spawnX, spawnY, radius) {
  const cx = x + w / 2, cy = y + h / 2;
  return Math.sqrt((cx - spawnX) ** 2 + (cy - spawnY) ** 2) < radius;
}

function overlapsAny(x, y, w, h, rects, pad) {
  for (const r of rects) {
    if (x < r.x + r.w + pad && x + w + pad > r.x &&
        y < r.y + r.h + pad && y + h + pad > r.y) return true;
  }
  return false;
}

function tryPlace(w, h, spawnX, spawnY, safeR, rects, pad, margin) {
  for (let a = 0; a < 200; a++) {
    const x = margin + Math.random() * (WORLD_W - w - margin * 2);
    const y = margin + Math.random() * (WORLD_H - h - margin * 2);
    if (tooCloseToSpawn(x, y, w, h, spawnX, spawnY, safeR)) continue;
    if (overlapsAny(x, y, w, h, rects, pad)) continue;
    return { x, y };
  }
  return null;
}

// ── Generation ──────────────────────────────────────────────────────
export function generateObstacles(state) {
  const wave = state.wave;
  state.obstacles = [];
  state.decorations = [];

  const spawnX = WORLD_W / 2;
  const spawnY = WORLD_H / 2;
  const safeR = 180;
  const margin = 50;
  const placed = [];

  // Walls
  const wallCount = wave <= 2 ? 3 : wave <= 5 ? 4 : 5;
  for (let i = 0; i < wallCount; i++) {
    const tpl = WALL_SHAPES[Math.floor(Math.random() * WALL_SHAPES.length)];
    const cells = rotateShape(tpl.cells, Math.floor(Math.random() * 4));
    const bounds = shapeBounds(cells);
    const pos = tryPlace(bounds.w, bounds.h, spawnX, spawnY, safeR, placed, 12, margin);
    if (!pos) continue;
    placed.push({ x: pos.x, y: pos.y, w: bounds.w, h: bounds.h });
    for (const [cx, cy] of cells) {
      state.obstacles.push({
        x: pos.x + cx * BLOCK, y: pos.y + cy * BLOCK,
        width: BLOCK, height: BLOCK, type: 'wall',
      });
    }
  }

  // Houses
  const houseCount = wave <= 2 ? 2 : wave <= 5 ? 3 : 4;
  const houseSizes = [
    { bw: 3, bh: 3 }, { bw: 4, bh: 3 }, { bw: 3, bh: 2 }, { bw: 4, bh: 4 },
  ];
  for (let i = 0; i < houseCount; i++) {
    const hs = houseSizes[Math.floor(Math.random() * houseSizes.length)];
    const pw = hs.bw * BLOCK, ph = hs.bh * BLOCK;
    const pos = tryPlace(pw, ph, spawnX, spawnY, safeR, placed, 20, margin);
    if (!pos) continue;
    placed.push({ x: pos.x, y: pos.y, w: pw, h: ph });
    const houseId = Math.floor(Math.random() * 1000);
    const roofColor = ['#8b3a3a', '#3a5c8b', '#6b6b3a', '#5a3a6b'][i % 4];
    for (let by = 0; by < hs.bh; by++) {
      for (let bx = 0; bx < hs.bw; bx++) {
        state.obstacles.push({
          x: pos.x + bx * BLOCK, y: pos.y + by * BLOCK,
          width: BLOCK, height: BLOCK, type: 'house',
          houseId, bw: hs.bw, bh: hs.bh,
          localX: bx, localY: by, roofColor,
        });
      }
    }
  }

  // Trees
  const treeCount = wave <= 2 ? 6 : wave <= 5 ? 8 : 10;
  for (let i = 0; i < treeCount; i++) {
    const size = 20 + Math.floor(Math.random() * 12);
    const pos = tryPlace(size, size, spawnX, spawnY, safeR, placed, 16, margin);
    if (!pos) continue;
    placed.push({ x: pos.x, y: pos.y, w: size, h: size });
    const variant = Math.floor(Math.random() * 3);
    state.obstacles.push({
      x: pos.x, y: pos.y, width: size, height: size,
      type: 'tree', treeSize: size, variant,
    });
  }

  // Bushes
  const bushCount = wave <= 2 ? 5 : wave <= 5 ? 8 : 12;
  for (let i = 0; i < bushCount; i++) {
    const bw = 14 + Math.floor(Math.random() * 10);
    const bh = 10 + Math.floor(Math.random() * 8);
    const pos = tryPlace(bw, bh, spawnX, spawnY, safeR, placed, 8, margin);
    if (!pos) continue;
    placed.push({ x: pos.x, y: pos.y, w: bw, h: bh });
    const variant = Math.floor(Math.random() * 3);
    state.obstacles.push({
      x: pos.x, y: pos.y, width: bw, height: bh,
      type: 'bush', variant,
    });
  }

  // Abandoned Cars
  const carCount = wave <= 2 ? 1 : wave <= 5 ? 2 : 3;
  for (let i = 0; i < carCount; i++) {
    const pos = tryPlace(64, 32, spawnX, spawnY, safeR, placed, 12, margin);
    if (!pos) continue;
    placed.push({ x: pos.x, y: pos.y, w: 64, h: 32 });
    state.obstacles.push({
      x: pos.x, y: pos.y, width: 64, height: 32, type: 'car',
    });
  }

  // Dumpsters
  const dumpsterCount = wave <= 2 ? 1 : wave <= 5 ? 2 : 3;
  for (let i = 0; i < dumpsterCount; i++) {
    const pos = tryPlace(40, 40, spawnX, spawnY, safeR, placed, 12, margin);
    if (!pos) continue;
    placed.push({ x: pos.x, y: pos.y, w: 40, h: 40 });
    state.obstacles.push({
      x: pos.x, y: pos.y, width: 40, height: 40, type: 'dumpster',
    });
  }

  // Concrete Barriers
  const barrierCount = wave <= 2 ? 2 : wave <= 5 ? 3 : 4;
  for (let i = 0; i < barrierCount; i++) {
    const pos = tryPlace(80, 16, spawnX, spawnY, safeR, placed, 10, margin);
    if (!pos) continue;
    placed.push({ x: pos.x, y: pos.y, w: 80, h: 16 });
    state.obstacles.push({
      x: pos.x, y: pos.y, width: 80, height: 16, type: 'barrier',
    });
  }

  // Ruined Wall Segments (L-shape from 2 rects)
  const ruinCount = wave <= 2 ? 1 : wave <= 5 ? 2 : 2;
  const ruinVariants = [
    [{ rx: 0, ry: 0, rw: 16, rh: 40 }, { rx: 0, ry: 24, rw: 40, rh: 16 }],
    [{ rx: 24, ry: 0, rw: 16, rh: 40 }, { rx: 0, ry: 24, rw: 40, rh: 16 }],
    [{ rx: 0, ry: 0, rw: 16, rh: 40 }, { rx: 0, ry: 0, rw: 40, rh: 16 }],
    [{ rx: 24, ry: 0, rw: 16, rh: 40 }, { rx: 0, ry: 0, rw: 40, rh: 16 }],
  ];
  for (let i = 0; i < ruinCount; i++) {
    const pos = tryPlace(40, 40, spawnX, spawnY, safeR, placed, 12, margin);
    if (!pos) continue;
    placed.push({ x: pos.x, y: pos.y, w: 40, h: 40 });
    const variant = ruinVariants[Math.floor(Math.random() * ruinVariants.length)];
    for (const part of variant) {
      state.obstacles.push({
        x: pos.x + part.rx, y: pos.y + part.ry,
        width: part.rw, height: part.rh, type: 'ruined-wall',
      });
    }
  }

  // Chain-link Fence Post Clusters (bullets pass through)
  const fenceCount = wave <= 2 ? 1 : wave <= 5 ? 2 : 3;
  for (let i = 0; i < fenceCount; i++) {
    const postW = 4, postH = 28, gap = 8;
    const totalW = postW * 3 + gap * 2;
    const pos = tryPlace(totalW, postH, spawnX, spawnY, safeR, placed, 10, margin);
    if (!pos) continue;
    placed.push({ x: pos.x, y: pos.y, w: totalW, h: postH });
    for (let p = 0; p < 3; p++) {
      state.obstacles.push({
        x: pos.x + p * (postW + gap), y: pos.y,
        width: postW, height: postH, type: 'fence',
        bulletsPassThrough: true,
      });
    }
  }

  // Sandbag Stacks
  const sandbagCount = wave <= 2 ? 2 : wave <= 5 ? 3 : 4;
  for (let i = 0; i < sandbagCount; i++) {
    const pos = tryPlace(48, 20, spawnX, spawnY, safeR, placed, 10, margin);
    if (!pos) continue;
    placed.push({ x: pos.x, y: pos.y, w: 48, h: 20 });
    state.obstacles.push({
      x: pos.x, y: pos.y, width: 48, height: 20, type: 'sandbag',
    });
  }

  // Paths (decorative, no collision)
  const pathCount = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < pathCount; i++) {
    const horizontal = Math.random() > 0.5;
    const len = 120 + Math.floor(Math.random() * 200);
    const thickness = 18 + Math.floor(Math.random() * 10);
    const pw = horizontal ? len : thickness;
    const ph = horizontal ? thickness : len;
    const x = margin + Math.random() * (WORLD_W - pw - margin * 2);
    const y = margin + Math.random() * (WORLD_H - ph - margin * 2);
    state.decorations.push({ x, y, w: pw, h: ph, type: 'path' });
  }
}

// ── Drawing ─────────────────────────────────────────────────────────

export function drawPaths(ctx, decorations) {
  if (!decorations) return;
  for (const d of decorations) {
    if (d.type !== 'path') continue;
    const x = Math.floor(d.x), y = Math.floor(d.y);

    ctx.fillStyle = '#6b5c3e';
    ctx.fillRect(x, y, d.w, d.h);

    ctx.fillStyle = '#7a6b4e';
    ctx.fillRect(x + 2, y + 2, d.w - 4, d.h - 4);

    const seeded = (a, b) => ((a * 2654435761 + b * 40503) ^ 7919) >>> 0;
    for (let py = y + 3; py < y + d.h - 3; py += 6) {
      for (let px = x + 3; px < x + d.w - 3; px += 6) {
        const v = seeded(px, py) % 100;
        if (v < 20) {
          ctx.fillStyle = '#8a7b5e';
          ctx.fillRect(px, py, 3, 3);
        } else if (v < 35) {
          ctx.fillStyle = '#5c4e35';
          ctx.fillRect(px, py, 2, 2);
        }
      }
    }

    ctx.fillStyle = '#5a4d34';
    ctx.fillRect(x, y, d.w, 2);
    ctx.fillRect(x, y + d.h - 2, d.w, 2);
    ctx.fillRect(x, y, 2, d.h);
    ctx.fillRect(x + d.w - 2, y, 2, d.h);
  }
}

export function drawObstacles(ctx, obstacles) {
  const wallOccupied = new Set();
  for (const o of obstacles) {
    if (o.type === 'wall') wallOccupied.add(`${o.x},${o.y}`);
  }

  for (const o of obstacles) {
    switch (o.type) {
      case 'wall':        drawWall(ctx, o, wallOccupied); break;
      case 'house':       drawHouseBlock(ctx, o); break;
      case 'tree':        drawTree(ctx, o); break;
      case 'bush':        drawBush(ctx, o); break;
      case 'car':         drawCar(ctx, o); break;
      case 'dumpster':    drawDumpster(ctx, o); break;
      case 'barrier':     drawBarrier(ctx, o); break;
      case 'ruined-wall': drawRuinedWall(ctx, o); break;
      case 'fence':       drawFencePost(ctx, o); break;
      case 'sandbag':     drawSandbag(ctx, o); break;
      default:            drawWall(ctx, o, wallOccupied); break;
    }
  }
}

// ── Wall drawing ────────────────────────────────────────────────────
function drawWall(ctx, o, occupied) {
  const x = Math.floor(o.x), y = Math.floor(o.y);

  const hasTop = occupied.has(`${x},${y - BLOCK}`);
  const hasBot = occupied.has(`${x},${y + BLOCK}`);
  const hasLeft = occupied.has(`${x - BLOCK},${y}`);
  const hasRight = occupied.has(`${x + BLOCK},${y}`);

  ctx.fillStyle = '#4a3728';
  ctx.fillRect(x, y, BLOCK, BLOCK);
  ctx.fillStyle = '#5c4433';
  ctx.fillRect(x + 2, y + 2, BLOCK - 4, BLOCK - 4);
  ctx.fillStyle = '#6b5240';
  ctx.fillRect(x + 3, y + 3, BLOCK - 6, BLOCK - 7);
  ctx.fillStyle = '#4a3728';
  ctx.fillRect(x + 3, y + BLOCK - 4, BLOCK - 6, 1);

  ctx.fillStyle = '#3d2c1e';
  ctx.fillRect(x + 2, y + Math.floor(BLOCK / 2) - 1, BLOCK - 4, 1);

  if (!hasTop) { ctx.fillStyle = '#7a6350'; ctx.fillRect(x + 2, y + 1, BLOCK - 4, 2); }
  if (!hasLeft) { ctx.fillStyle = '#7a6350'; ctx.fillRect(x + 1, y + 2, 2, BLOCK - 4); }
  if (!hasBot) { ctx.fillStyle = '#362318'; ctx.fillRect(x + 2, y + BLOCK - 2, BLOCK - 4, 2); }
  if (!hasRight) { ctx.fillStyle = '#362318'; ctx.fillRect(x + BLOCK - 2, y + 2, 2, BLOCK - 4); }

  if (hasTop) { ctx.fillStyle = '#5c4433'; ctx.fillRect(x + 2, y, BLOCK - 4, 2); }
  if (hasBot) { ctx.fillStyle = '#5c4433'; ctx.fillRect(x + 2, y + BLOCK - 2, BLOCK - 4, 2); }
  if (hasLeft) { ctx.fillStyle = '#5c4433'; ctx.fillRect(x, y + 2, 2, BLOCK - 4); }
  if (hasRight) { ctx.fillStyle = '#5c4433'; ctx.fillRect(x + BLOCK - 2, y + 2, 2, BLOCK - 4); }
}

// ── House drawing ───────────────────────────────────────────────────
function drawHouseBlock(ctx, o) {
  const x = Math.floor(o.x), y = Math.floor(o.y);
  const lx = o.localX, ly = o.localY;
  const bw = o.bw, bh = o.bh;
  const roofRows = Math.max(1, Math.floor(bh / 3));
  const isRoof = ly < roofRows;

  if (isRoof) {
    ctx.fillStyle = o.roofColor;
    ctx.fillRect(x, y, BLOCK, BLOCK);

    const lighter = shiftColor(o.roofColor, 30);
    ctx.fillStyle = lighter;
    ctx.fillRect(x + 1, y + 1, BLOCK - 2, 2);

    const darker = shiftColor(o.roofColor, -20);
    ctx.fillStyle = darker;
    ctx.fillRect(x + 1, y + BLOCK - 2, BLOCK - 2, 1);

    for (let stripe = y + 4; stripe < y + BLOCK; stripe += 6) {
      ctx.fillStyle = darker;
      ctx.fillRect(x + 1, stripe, BLOCK - 2, 1);
    }

    if (ly === roofRows - 1) {
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(x, y + BLOCK - 1, BLOCK, 1);
    }
  } else {
    ctx.fillStyle = '#c8b897';
    ctx.fillRect(x, y, BLOCK, BLOCK);

    ctx.fillStyle = '#d4c8a8';
    ctx.fillRect(x + 1, y + 1, BLOCK - 2, BLOCK - 2);

    ctx.fillStyle = '#b8a880';
    ctx.fillRect(x + 1, y + BLOCK - 2, BLOCK - 2, 1);

    const isMidX = lx > 0 && lx < bw - 1;
    const isBottomWall = ly === bh - 1;
    const isMidBody = ly > roofRows;

    if (isMidX && isMidBody) {
      ctx.fillStyle = '#6a8cba';
      ctx.fillRect(x + 6, y + 4, BLOCK - 12, BLOCK - 8);
      ctx.fillStyle = '#8ab4e0';
      ctx.fillRect(x + 7, y + 5, BLOCK - 14, BLOCK - 10);
      ctx.fillStyle = '#5a7ca0';
      ctx.fillRect(x + Math.floor(BLOCK / 2) - 1, y + 4, 1, BLOCK - 8);
      ctx.fillRect(x + 6, y + Math.floor(BLOCK / 2), BLOCK - 12, 1);
    }

    if (isBottomWall && lx === Math.floor(bw / 2)) {
      ctx.fillStyle = '#5a4030';
      ctx.fillRect(x + 6, y + 6, BLOCK - 12, BLOCK - 6);
      ctx.fillStyle = '#4a3020';
      ctx.fillRect(x + 7, y + 7, BLOCK - 14, BLOCK - 8);
      ctx.fillStyle = '#d4a830';
      ctx.fillRect(x + BLOCK - 10, y + Math.floor(BLOCK / 2) + 2, 2, 2);
    }
  }

  if (lx === 0) { ctx.fillStyle = '#3a3a3a'; ctx.fillRect(x, y, 1, BLOCK); }
  if (lx === bw - 1) { ctx.fillStyle = '#3a3a3a'; ctx.fillRect(x + BLOCK - 1, y, 1, BLOCK); }
  if (ly === 0) { ctx.fillStyle = '#3a3a3a'; ctx.fillRect(x, y, BLOCK, 1); }
  if (ly === bh - 1) { ctx.fillStyle = '#3a3a3a'; ctx.fillRect(x, y + BLOCK - 1, BLOCK, 1); }
}

function shiftColor(hex, amount) {
  const r = Math.min(255, Math.max(0, parseInt(hex.slice(1, 3), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(hex.slice(3, 5), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(hex.slice(5, 7), 16) + amount));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ── Tree drawing ────────────────────────────────────────────────────
function drawTree(ctx, o) {
  const cx = Math.floor(o.x + o.width / 2);
  const cy = Math.floor(o.y + o.height / 2);
  const s = o.treeSize;
  const r = Math.floor(s / 2);

  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(cx - 3, cy - 2, 6, r + 4);

  ctx.fillStyle = '#4a3522';
  ctx.fillRect(cx - 2, cy - 2, 4, r + 4);

  const canopyR = r + 4;
  const greens = ['#2a6b20', '#347a28', '#256018'][o.variant];
  const lighter = ['#3a8a30', '#44943a', '#358028'][o.variant];
  const darker = ['#1e5516', '#245a1c', '#1a4c12'][o.variant];

  drawPixelCircle(ctx, cx, cy - 4, canopyR, greens);

  drawPixelCircle(ctx, cx - 3, cy - 6, canopyR - 4, lighter);
  drawPixelCircle(ctx, cx + 4, cy - 2, canopyR - 5, darker);

  ctx.fillStyle = lighter;
  ctx.fillRect(cx - 2, cy - canopyR + 1, 3, 2);
  ctx.fillRect(cx - canopyR + 2, cy - 3, 2, 3);
}

function drawPixelCircle(ctx, cx, cy, radius, color) {
  ctx.fillStyle = color;
  for (let dy = -radius; dy <= radius; dy += 2) {
    const halfW = Math.floor(Math.sqrt(radius * radius - dy * dy));
    ctx.fillRect(cx - halfW, cy + dy, halfW * 2, 2);
  }
}

// ── Bush drawing ────────────────────────────────────────────────────
function drawBush(ctx, o) {
  const x = Math.floor(o.x), y = Math.floor(o.y);
  const w = o.width, h = o.height;

  const colors = [
    { main: '#3a7a2a', light: '#4a9a38', dark: '#2a5a1a' },
    { main: '#4a8a30', light: '#5aaa42', dark: '#346a22' },
    { main: '#2e6e22', light: '#3e8830', dark: '#1e5016' },
  ][o.variant];

  ctx.fillStyle = colors.dark;
  ctx.fillRect(x + 2, y + h - 3, w - 4, 3);

  ctx.fillStyle = colors.main;
  const rx = Math.floor(w / 2), ry = Math.floor(h / 2);
  const cx = x + rx, cy = y + ry;
  for (let dy = -ry; dy <= ry; dy += 2) {
    const halfW = Math.floor(rx * Math.sqrt(1 - (dy * dy) / (ry * ry)));
    ctx.fillRect(cx - halfW, cy + dy, halfW * 2, 2);
  }

  ctx.fillStyle = colors.light;
  for (let dy = -ry + 2; dy <= 0; dy += 3) {
    const halfW = Math.floor((rx - 2) * Math.sqrt(1 - (dy * dy) / (ry * ry)));
    ctx.fillRect(cx - halfW + 1, cy + dy, Math.max(2, halfW), 2);
  }

  ctx.fillStyle = colors.dark;
  ctx.fillRect(cx - 1, cy + ry - 2, 3, 2);
}

// ── Car drawing (top-down view) ─────────────────────────────────────
function drawCar(ctx, o) {
  const x = Math.floor(o.x), y = Math.floor(o.y);
  const w = 64, h = 32;

  // Drop shadow
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(x + 3, y + 3, w, h);

  // Tires poking out from body sides
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(x + 6, y - 2, 10, 5);
  ctx.fillRect(x + 6, y + h - 3, 10, 5);
  ctx.fillRect(x + w - 16, y - 2, 10, 5);
  ctx.fillRect(x + w - 16, y + h - 3, 10, 5);
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(x + 7, y - 1, 8, 3);
  ctx.fillRect(x + 7, y + h - 2, 8, 3);
  ctx.fillRect(x + w - 15, y - 1, 8, 3);
  ctx.fillRect(x + w - 15, y + h - 2, 8, 3);

  // Main body
  ctx.fillStyle = '#5c5060';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#6a6070';
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);

  // Hood (front, right side)
  ctx.fillStyle = '#585060';
  ctx.fillRect(x + w - 20, y + 1, 19, h - 2);
  ctx.fillStyle = '#626068';
  ctx.fillRect(x + w - 18, y + 3, 16, h - 6);
  ctx.fillStyle = '#555058';
  ctx.fillRect(x + w - 11, y + 4, 1, h - 8);

  // Trunk (rear, left side)
  ctx.fillStyle = '#585060';
  ctx.fillRect(x + 1, y + 1, 16, h - 2);
  ctx.fillStyle = '#626068';
  ctx.fillRect(x + 3, y + 3, 12, h - 6);

  // Roof / cabin
  ctx.fillStyle = '#484050';
  ctx.fillRect(x + 18, y + 3, 24, h - 6);
  ctx.fillStyle = '#524a5a';
  ctx.fillRect(x + 19, y + 4, 22, h - 8);

  // Windshield (between hood and roof)
  ctx.fillStyle = '#5a7a8a';
  ctx.fillRect(x + 42, y + 4, 4, h - 8);
  ctx.fillStyle = '#6a8a9a';
  ctx.fillRect(x + 42, y + 5, 3, h - 10);
  // Crack in windshield
  ctx.fillStyle = '#8aaaba';
  ctx.fillRect(x + 43, y + 7, 1, 5);
  ctx.fillRect(x + 42, y + 10, 1, 3);

  // Rear window
  ctx.fillStyle = '#4a6a7a';
  ctx.fillRect(x + 16, y + 5, 3, h - 10);
  ctx.fillStyle = '#5a7888';
  ctx.fillRect(x + 16, y + 6, 2, h - 12);

  // Headlights (front)
  ctx.fillStyle = '#aaa870';
  ctx.fillRect(x + w - 2, y + 4, 2, 4);
  ctx.fillRect(x + w - 2, y + h - 8, 2, 4);

  // Taillights (rear)
  ctx.fillStyle = '#8a2020';
  ctx.fillRect(x, y + 4, 2, 3);
  ctx.fillRect(x, y + h - 7, 2, 3);

  // Rust patches
  ctx.fillStyle = '#7a4a2a';
  ctx.fillRect(x + 8, y + 2, 4, 2);
  ctx.fillRect(x + w - 8, y + h - 5, 3, 3);
  ctx.fillStyle = '#6a3a1a';
  ctx.fillRect(x + 30, y + 2, 3, 2);
  ctx.fillRect(x + 3, y + h - 4, 5, 2);

  // Dents / damage
  ctx.fillStyle = '#504850';
  ctx.fillRect(x + 24, y, 6, 1);
  ctx.fillRect(x + 50, y + h - 1, 8, 1);

  // Body outline
  ctx.fillStyle = '#302830';
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);
}

// ── Dumpster drawing ────────────────────────────────────────────────
function drawDumpster(ctx, o) {
  const x = Math.floor(o.x), y = Math.floor(o.y);
  const w = 40, h = 40;

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(x + 2, y + h - 2, w - 4, 3);

  ctx.fillStyle = '#2a5a2a';
  ctx.fillRect(x, y + 6, w, h - 8);
  ctx.fillStyle = '#347a34';
  ctx.fillRect(x + 2, y + 8, w - 4, h - 12);

  ctx.fillStyle = '#1e4e1e';
  ctx.fillRect(x - 1, y + 4, w + 2, 6);
  ctx.fillStyle = '#245a24';
  ctx.fillRect(x + 1, y + 5, w - 2, 4);

  ctx.fillStyle = '#555555';
  ctx.fillRect(x + w / 2 - 4, y + 4, 8, 2);
  ctx.fillStyle = '#666666';
  ctx.fillRect(x + w / 2 - 3, y + 4, 6, 1);

  ctx.fillStyle = '#1e4e1e';
  ctx.fillRect(x + 2, y + 14, w - 4, 1);
  ctx.fillRect(x + 2, y + 22, w - 4, 1);
  ctx.fillRect(x + 2, y + 30, w - 4, 1);

  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(x, y + h - 3, w, 3);
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(x + 1, y + h - 2, w - 2, 1);

  ctx.fillStyle = '#1a3a1a';
  ctx.fillRect(x, y + 6, 1, h - 8);
  ctx.fillRect(x + w - 1, y + 6, 1, h - 8);
}

// ── Concrete Barrier drawing ────────────────────────────────────────
function drawBarrier(ctx, o) {
  const x = Math.floor(o.x), y = Math.floor(o.y);
  const w = 80, h = 16;

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(x + 1, y + h - 1, w - 2, 2);

  ctx.fillStyle = '#888888';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#999999';
  ctx.fillRect(x + 1, y + 1, w - 2, h - 3);

  ctx.fillStyle = '#aaaaaa';
  ctx.fillRect(x + 1, y + 1, w - 2, 2);
  ctx.fillStyle = '#666666';
  ctx.fillRect(x + 1, y + h - 2, w - 2, 2);

  ctx.fillStyle = '#c8a820';
  for (let sx = x + 2; sx < x + w - 2; sx += 12) {
    ctx.fillRect(sx, y + 5, 8, 3);
  }

  ctx.fillStyle = '#777777';
  for (let tx = x + 4; tx < x + w - 4; tx += 10) {
    ctx.fillRect(tx, y + 10, 2, 1);
    ctx.fillRect(tx + 5, y + 3, 1, 2);
  }

  ctx.fillStyle = '#555555';
  ctx.fillRect(x + 3, y + 6, 2, 2);
  ctx.fillRect(x + w - 5, y + 6, 2, 2);
}

// ── Ruined Wall drawing ─────────────────────────────────────────────
function drawRuinedWall(ctx, o) {
  const x = Math.floor(o.x), y = Math.floor(o.y);
  const w = o.width, h = o.height;

  ctx.fillStyle = '#7a7a72';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#8a8a82';
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);

  ctx.fillStyle = '#6a6a62';
  for (let by = y + 2; by < y + h - 2; by += 5) {
    const offset = ((by - y) % 10 < 5) ? 0 : 6;
    for (let bx = x + 2 + offset; bx < x + w - 2; bx += 12) {
      ctx.fillRect(bx, by, Math.min(10, x + w - 2 - bx), 1);
    }
  }

  ctx.fillStyle = '#555550';
  ctx.fillRect(x + Math.floor(w * 0.3), y + 2, 1, Math.floor(h * 0.4));
  ctx.fillRect(x + Math.floor(w * 0.3), y + 2 + Math.floor(h * 0.4), 2, 1);
  ctx.fillRect(x + Math.floor(w * 0.7), y + Math.floor(h * 0.5), 1, Math.floor(h * 0.4));

  ctx.fillStyle = '#5a5a52';
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);

  ctx.fillStyle = '#9a9a90';
  ctx.fillRect(x + 3, y + 3, 2, 2);
  if (w > 10) ctx.fillRect(x + w - 5, y + h - 5, 2, 1);
}

// ── Fence Post drawing ──────────────────────────────────────────────
function drawFencePost(ctx, o) {
  const x = Math.floor(o.x), y = Math.floor(o.y);
  const w = o.width, h = o.height;

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(x + 1, y + h - 1, w - 1, 2);

  ctx.fillStyle = '#7a7a7a';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#999999';
  ctx.fillRect(x, y, 1, h);
  ctx.fillStyle = '#5a5a5a';
  ctx.fillRect(x + w - 1, y, 1, h);

  ctx.fillStyle = '#8a8a8a';
  ctx.fillRect(x - 1, y, w + 2, 3);
  ctx.fillStyle = '#aaaaaa';
  ctx.fillRect(x, y, w, 1);

  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#8a8a8a';
  for (let ly = y + 5; ly < y + h - 2; ly += 3) {
    ctx.fillRect(x + w, ly, 8, 1);
  }
  for (let ly = y + 6; ly < y + h - 2; ly += 5) {
    const meshX = x + w;
    for (let mx = meshX; mx < meshX + 8; mx += 3) {
      ctx.fillRect(mx, ly - 2, 1, 4);
    }
  }
  ctx.globalAlpha = 1.0;
}

// ── Sandbag drawing ─────────────────────────────────────────────────
function drawSandbag(ctx, o) {
  const x = Math.floor(o.x), y = Math.floor(o.y);
  const w = 48, h = 20;

  ctx.fillStyle = '#3a3020';
  ctx.fillRect(x + 1, y + h - 1, w - 2, 2);

  ctx.fillStyle = '#a89060';
  ctx.fillRect(x, y + 8, w, 12);
  ctx.fillStyle = '#b8a070';
  ctx.fillRect(x + 1, y + 9, w - 2, 10);

  ctx.fillStyle = '#8a7a50';
  ctx.fillRect(x + 12, y + 8, 1, 12);
  ctx.fillRect(x + 24, y + 8, 1, 12);
  ctx.fillRect(x + 36, y + 8, 1, 12);

  ctx.fillStyle = '#b89868';
  ctx.fillRect(x + 4, y, w - 8, 10);
  ctx.fillStyle = '#c8a878';
  ctx.fillRect(x + 5, y + 1, w - 10, 8);

  ctx.fillStyle = '#9a8858';
  ctx.fillRect(x + 16, y, 1, 10);
  ctx.fillRect(x + 28, y, 1, 10);

  ctx.fillStyle = '#9a8858';
  for (let tx = x + 3; tx < x + w - 3; tx += 7) {
    ctx.fillRect(tx, y + 4, 2, 1);
    ctx.fillRect(tx + 3, y + 14, 2, 1);
  }

  ctx.fillStyle = '#7a6a48';
  ctx.fillRect(x, y + 8, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
}
