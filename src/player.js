import { getSprite, getAnimFrame, PLAYER_ANIMS, GUN_META } from './sprites.js';

export function updatePlayer(state, dt) {
  const { player, keys } = state;

  let vx = 0;
  let vy = 0;

  if (keys.has('w')) vy -= 1;
  if (keys.has('s')) vy += 1;
  if (keys.has('a')) vx -= 1;
  if (keys.has('d')) vx += 1;

  if (vx !== 0 && vy !== 0) {
    const len = Math.sqrt(vx * vx + vy * vy);
    vx /= len;
    vy /= len;
  }

  player.moving = vx !== 0 || vy !== 0;

  player.x += vx * player.speed * dt;
  player.y += vy * player.speed * dt;

  player.x = Math.max(0, Math.min(640 - player.width, player.x));
  player.y = Math.max(0, Math.min(480 - player.height, player.y));

  if (player.invincible) {
    player.invTimer -= dt;
    if (player.invTimer <= 0) {
      player.invincible = false;
      player.invTimer = 0;
    }
  }
}

export function drawPlayer(ctx, player, mouseX, mouseY) {
  if (player.invincible && Math.floor(player.invTimer * 10) % 2 === 0) {
    return;
  }

  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;

  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  const angle = Math.atan2(dy, dx);

  const anim = player.moving ? PLAYER_ANIMS.run : PLAYER_ANIMS.idle;
  const sprite = getSprite(anim.key);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);

  if (sprite) {
    const frame = getAnimFrame(anim.frames, anim.frameDuration);
    const sx = frame * anim.frameWidth;
    const cropX = 35;
    const cropY = 12;
    const cropW = 26;
    const cropH = 32;
    const scale = 2;
    const drawW = cropW * scale;
    const drawH = cropH * scale;
    ctx.drawImage(
      sprite,
      sx + cropX, cropY, cropW, cropH,
      -drawW / 2, -drawH / 2, drawW, drawH
    );
  } else {
    drawPlayerFallback(ctx);
  }

  drawWeapon(ctx, player);

  ctx.restore();
}

function drawWeapon(ctx, player) {
  const meta = GUN_META[player.currentWeapon];
  if (!meta) return;

  const weaponSprite = getSprite(meta.key);
  if (!weaponSprite) return;

  const scale = 1.2;
  const drawW = meta.w * scale;
  const drawH = meta.h * scale;
  const offsetX = 10;
  const offsetY = -drawH / 2 + 2;

  ctx.drawImage(weaponSprite, offsetX, offsetY, drawW, drawH);
}

function drawPlayerFallback(ctx) {
  ctx.fillStyle = '#14b8a6';
  ctx.fillRect(-6, -8, 12, 16);

  ctx.fillStyle = '#5eead4';
  ctx.fillRect(-6, -8, 12, 6);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-4, -6, 2, 2);
  ctx.fillRect(2, -6, 2, 2);

  ctx.fillStyle = '#14b8a6';
  ctx.fillRect(-8, -2, 2, 10);
  ctx.fillRect(6, -2, 2, 10);

  ctx.fillRect(-4, 8, 2, 8);
  ctx.fillRect(2, 8, 2, 8);
}
