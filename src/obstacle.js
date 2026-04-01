const BLOCK = 20;

const SHAPES = [
  { name: 'I', cells: [[0,0],[1,0],[2,0],[3,0]] },
  { name: 'L', cells: [[0,0],[0,1],[1,1],[2,1]] },
  { name: 'J', cells: [[2,0],[0,1],[1,1],[2,1]] },
  { name: 'T', cells: [[1,0],[0,1],[1,1],[2,1]] },
  { name: 'S', cells: [[1,0],[2,0],[0,1],[1,1]] },
  { name: 'Z', cells: [[0,0],[1,0],[1,1],[2,1]] },
  { name: 'O', cells: [[0,0],[1,0],[0,1],[1,1]] },
  { name: 'Plus', cells: [[1,0],[0,1],[1,1],[2,1],[1,2]] },
  { name: 'BigL', cells: [[0,0],[0,1],[0,2],[1,2],[2,2]] },
  { name: 'Line3', cells: [[0,0],[1,0],[2,0]] },
  { name: 'Corner', cells: [[0,0],[1,0],[0,1]] },
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
  if (wave <= 2) shapeCount = 2;
  else if (wave <= 5) shapeCount = 3;
  else shapeCount = 4;

  state.obstacles = [];
  const placed = [];
  const playerSpawnX = 320;
  const playerSpawnY = 240;
  const safeRadius = 100;

  for (let i = 0; i < shapeCount; i++) {
    const template = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const rotation = Math.floor(Math.random() * 4);
    const cells = rotateShape(template.cells, rotation);
    const bounds = shapeBounds(cells);

    let ox, oy, valid;
    let attempts = 0;

    do {
      valid = true;
      ox = Math.floor(Math.random() * (640 - bounds.w));
      oy = Math.floor(Math.random() * (480 - bounds.h));

      for (const [cx, cy] of cells) {
        const bx = ox + cx * BLOCK + BLOCK / 2;
        const by = oy + cy * BLOCK + BLOCK / 2;
        const dx = bx - playerSpawnX;
        const dy = by - playerSpawnY;
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
      if (attempts > 200) break;
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
