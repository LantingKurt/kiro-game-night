import { getSprite, getAnimFrame, ZOMBIE_SHEET } from './sprites.js';

export function spawnWave(state) {
  const { wave, enemies } = state;
  const enemyCount = 3 + (wave * 2);
  const enemySpeed = 60 + (wave * 8);

  enemies.length = 0;

  for (let i = 0; i < enemyCount; i++) {
    const edge = Math.floor(Math.random() * 4);
    let x, y;

    switch (edge) {
      case 0: x = Math.random() * 640; y = 0; break;
      case 1: x = 640 - 14; y = Math.random() * 480; break;
      case 2: x = Math.random() * 640; y = 480 - 14; break;
      case 3: x = 0; y = Math.random() * 480; break;
    }

    enemies.push({
      x, y,
      speed: enemySpeed,
      width: 14,
      height: 14,
      alive: true,
      colorTint: Math.floor(Math.random() * 3),
      animOffset: Math.floor(Math.random() * ZOMBIE_SHEET.walkFrames),
    });
  }
}

export function updateEnemies(state, dt) {
  const { player, enemies, obstacles } = state;
  const playerCenterX = player.x + player.width / 2;
  const playerCenterY = player.y + player.height / 2;

  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    const enemyCenterX = enemy.x + enemy.width / 2;
    const enemyCenterY = enemy.y + enemy.height / 2;

    let dx = playerCenterX - enemyCenterX;
    let dy = playerCenterY - enemyCenterY;

    if (obstacles) {
      for (const obstacle of obstacles) {
        const obstacleCenterX = obstacle.x + obstacle.width / 2;
        const obstacleCenterY = obstacle.y + obstacle.height / 2;

        const obstDx = enemyCenterX - obstacleCenterX;
        const obstDy = enemyCenterY - obstacleCenterY;
        const obstDist = Math.sqrt(obstDx * obstDx + obstDy * obstDy);

        if (obstDist < 60 && obstDist > 0) {
          const repulsionStrength = (60 - obstDist) / 60;
          dx += (obstDx / obstDist) * repulsionStrength * 100;
          dy += (obstDy / obstDist) * repulsionStrength * 100;
        }
      }
    }

    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      enemy.x += (dx / dist) * enemy.speed * dt;
      enemy.y += (dy / dist) * enemy.speed * dt;
    }
  }
}

export function drawEnemies(ctx, enemies) {
  const zombieSprite = getSprite('zombieSheet');

  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    const cx = Math.floor(enemy.x + enemy.width / 2);
    const cy = Math.floor(enemy.y + enemy.height / 2);

    if (zombieSprite) {
      const frame = (getAnimFrame(ZOMBIE_SHEET.walkFrames, ZOMBIE_SHEET.frameDuration) + enemy.animOffset) % ZOMBIE_SHEET.walkFrames;
      const sx = frame * ZOMBIE_SHEET.frameWidth;
      const sy = ZOMBIE_SHEET.walkRow * ZOMBIE_SHEET.frameHeight;

      const drawSize = 48;

      ctx.save();
      if (enemy.colorTint > 0) {
        const hueShift = [0, 30, -20][enemy.colorTint % 3];
        ctx.filter = `hue-rotate(${hueShift}deg)`;
      }
      ctx.drawImage(
        zombieSprite,
        sx, sy, ZOMBIE_SHEET.frameWidth, ZOMBIE_SHEET.frameHeight,
        cx - drawSize / 2, cy - drawSize / 2, drawSize, drawSize
      );
      ctx.filter = 'none';
      ctx.restore();
    } else {
      drawEnemyFallback(ctx, enemy);
    }
  }
}

function drawEnemyFallback(ctx, enemy) {
  const shambleOffset = Math.sin(Date.now() / 200) * 2;
  const x = Math.floor(enemy.x);
  const y = Math.floor(enemy.y);

  const colors = ['#2d5016', '#4a5d23', '#3d4a3a'];
  const bodyColor = colors[enemy.colorTint % 3];

  ctx.fillStyle = bodyColor;
  ctx.fillRect(x + 1, y + 4, 12, 14);

  ctx.fillStyle = '#3d5a1f';
  ctx.fillRect(x, y, 14, 8);

  ctx.fillStyle = bodyColor;
  ctx.fillRect(x - 2, y + 6, 18, 2);

  ctx.fillRect(x + 3, y + 14 + shambleOffset, 2, 6);
  ctx.fillRect(x + 9, y + 14 - shambleOffset, 2, 6);
}
