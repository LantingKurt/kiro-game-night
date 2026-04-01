import { WORLD_W, WORLD_H } from './camera.js';

const BLOCK = 24;

const SHAPES = [
  { name: 'LongWall', cells: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0]] },
  { name: 'Barrier',  cells: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]] },
  { name: 'BigL',     cells: [[0,0],[0,1],[0,2],[0,3],[0,4],[1,4],[2,4],[3,4]] },
  { name: 'BigT',     cells: [[0,0],[1,0],[2,0],[3,0],[4,0],[2,1],[2,2]] },
  { name: 'U-shape',  cells: [[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[2,2],[2,1],[2,0]] },
  { name: 'Zigzag',   cells: [[0,0],[1,0],[1,1],[2,1],[2,2],[3,2],[3,3]] },
  { name: 'Wall5',    cells: [[0,0],[1,0],[2,0],[3,0],[4,0]] },
  { name: 'Hook',     cells: [[0,0],[1,0],[2,0],[3,0],[3,1],[3,2]] },
  { name: 'Cross',    cells: [[2,0],[2,1],[0,2],[1,2],[2,2],[3,2],[4,2],[2,3],[2,4]] },
  { name: 'Corner',   cells: [[0,0],[1,0],[2,0],[0,1],[0,2]] },
  { name: 'O',        cells: [[0,0],[1,0],[0,1],[1,1]] },
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

export function generateObstacles(state) {
  const wave = state.wave;
  let shapeCount;
  if (wave <= 2) shapeCount = 4;
  else if (wave <= 5) shapeCount = 6;
  else shapeCount = 8;

  state.obstacles = [];
  const placed = [];
  const spawnX = WORLD_W / 2;
  const spawnY = WORLD_H / 2;
  const safeRadius = 140;

  for (let i = 0; i < shapeCount; i++) {
    const template = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const rotation = Math.floor(Math.random() * 4);
    const cells = rotateShape(template.cells, rotation);
    const bounds = shapeBounds(cells);

    let ox, oy, valid;
    let attempts = 0;

    do {
      valid = true;
      ox = Math.floor(Math.random() * (WORLD_W - bounds.w));
      oy = Math.floor(Math.random() * (WORLD_H - bounds.h));

      for (const [cx, cy] of cells) {
        const bx = ox + cx * BLOCK + BLOCK / 2;
        const by = oy + cy * BLOCK + BLOCK / 2;
        const dx = bx - spawnX;
        const dy = by - spawnY;
        if (Math.sqrt(dx * dx + dy * dy) < safeRadius) { valid = false; break; }
      }

      if (valid) {
        for (const prev of placed) {
          for (const [cx, cy] of cells) {
            const bx = ox + cx * BLOCK;
            const by = oy + cy * BLOCK;
            for (const [px, py] of prev.cells) {
              const pbx = prev.ox + px * BLOCK;
              const pby = prev.oy + py * BLOCK;
              if (Math.abs(bx - pbx) < BLOCK + 4 && Math.abs(by - pby) < BLOCK + 4) {
                valid = false; break;
              }
            }
            if (!valid) break;
          }
          if (!valid) break;
        }
      }

      attempts++;
      if (attempts > 300) break;
    } while (!valid);

    if (!valid) continue;

    placed.push({ cells, ox, oy });

    for (const [cx, cy] of cells) {
      state.obstacles.push({
        x: ox + cx * BLOCK,
        y: oy + cy * BLOCK,
        width: BLOCK,
        height: BLOCK,
      });
    }
  }
}

export function drawObstacles(ctx, obstacles) {
  const occupied = new Set();
  for (const o of obstacles) {
    occupied.add(`${o.x},${o.y}`);
  }

  for (const o of obstacles) {
    const x = Math.floor(o.x);
    const y = Math.floor(o.y);

    const hasTop = occupied.has(`${x},${y - BLOCK}`);
    const hasBot = occupied.has(`${x},${y + BLOCK}`);
    const hasLeft = occupied.has(`${x - BLOCK},${y}`);
    const hasRight = occupied.has(`${x + BLOCK},${y}`);

    ctx.fillStyle = '#3b4252';
    ctx.fillRect(x, y, BLOCK, BLOCK);

    ctx.fillStyle = '#434c5e';
    ctx.fillRect(x + 2, y + 2, BLOCK - 4, BLOCK - 4);

    ctx.fillStyle = '#4c566a';
    ctx.fillRect(x + 3, y + 3, BLOCK - 6, BLOCK - 7);

    ctx.fillStyle = '#3b4252';
    ctx.fillRect(x + 3, y + BLOCK - 4, BLOCK - 6, 1);

    if (!hasTop) {
      ctx.fillStyle = '#5e6779';
      ctx.fillRect(x + 2, y + 1, BLOCK - 4, 2);
    }
    if (!hasLeft) {
      ctx.fillStyle = '#5e6779';
      ctx.fillRect(x + 1, y + 2, 2, BLOCK - 4);
    }
    if (!hasBot) {
      ctx.fillStyle = '#2e3440';
      ctx.fillRect(x + 2, y + BLOCK - 2, BLOCK - 4, 2);
    }
    if (!hasRight) {
      ctx.fillStyle = '#2e3440';
      ctx.fillRect(x + BLOCK - 2, y + 2, 2, BLOCK - 4);
    }

    if (hasTop) {
      ctx.fillStyle = '#434c5e';
      ctx.fillRect(x + 2, y, BLOCK - 4, 2);
    }
    if (hasBot) {
      ctx.fillStyle = '#434c5e';
      ctx.fillRect(x + 2, y + BLOCK - 2, BLOCK - 4, 2);
    }
    if (hasLeft) {
      ctx.fillStyle = '#434c5e';
      ctx.fillRect(x, y + 2, 2, BLOCK - 4);
    }
    if (hasRight) {
      ctx.fillStyle = '#434c5e';
      ctx.fillRect(x + BLOCK - 2, y + 2, 2, BLOCK - 4);
    }
  }
}
