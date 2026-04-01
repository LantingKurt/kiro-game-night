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
      case 'wall':  drawWall(ctx, o, wallOccupied); break;
      case 'house': drawHouseBlock(ctx, o); break;
      case 'tree':  drawTree(ctx, o); break;
      case 'bush':  drawBush(ctx, o); break;
      default:      drawWall(ctx, o, wallOccupied); break;
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
