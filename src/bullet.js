import { getSprite } from './sprites.js';

export function updateBullets(state, dt) {
  const { bullets } = state;

  for (const bullet of bullets) {
    if (!bullet.alive) continue;

    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;

    if (bullet.x < 0 || bullet.x > 640 || bullet.y < 0 || bullet.y > 480) {
      bullet.alive = false;
    }
  }

  state.bullets = bullets.filter(b => b.alive);
}

export function drawBullets(ctx, bullets) {
  const bulletSprite = getSprite('bulletPistol');

  for (const bullet of bullets) {
    if (!bullet.alive) continue;

    const x = Math.floor(bullet.x);
    const y = Math.floor(bullet.y);

    if (bulletSprite) {
      const size = bullet.width || 4;
      const drawSize = Math.max(size * 2 + 2, 10);
      ctx.drawImage(
        bulletSprite,
        x - (drawSize - size) / 2,
        y - (drawSize - size) / 2,
        drawSize,
        drawSize
      );
    } else {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x, y, 4, 4);
    }
  }
}
