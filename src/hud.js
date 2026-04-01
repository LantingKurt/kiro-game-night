import { VIEW_W, VIEW_H } from './camera.js';
import { getSprite } from './sprites.js';

export function drawHUD(ctx, state) {
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px monospace';

  ctx.fillText(`Score: ${state.score}`, 10, 20);
  drawAmmoHUD(ctx, state);

  if (state.player.isReloading) {
    ctx.save();
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'right';
    ctx.fillText('Reloading...', VIEW_W - 10, VIEW_H - 60);
    drawReloadProgress(ctx, state, VIEW_W - 130, VIEW_H - 50);
    ctx.restore();
    ctx.fillStyle = '#ffffff';
  } else if (state.player.ammoInMagazine <= 0) {
    ctx.save();
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'right';
    ctx.fillText('Press R to reload', VIEW_W - 10, VIEW_H - 40);
    ctx.restore();
  }

  const waveText = `Wave: ${state.wave}`;
  const waveWidth = ctx.measureText(waveText).width;
  ctx.fillText(waveText, VIEW_W - waveWidth - 10, 20);

  drawHearts(ctx, state.player.hp);
}

function drawAmmoHUD(ctx, state) {
  const { ammoInMagazine, magazineSize, currentWeapon } = state.player;
  const icon = getSprite(getAmmoSpriteKey(currentWeapon));

  if (!icon) {
    ctx.save();
    ctx.textAlign = 'right';
    ctx.fillText(`Ammo: ${ammoInMagazine}/${magazineSize}`, VIEW_W - 10, VIEW_H - 10);
    ctx.restore();
    return;
  }

  const iconW = Math.max(8, Math.floor(icon.width * 2));
  const iconH = Math.max(4, Math.floor(icon.height * 2));
  const gap = 3;
  const totalWidth = (magazineSize * iconW) + ((magazineSize - 1) * gap);
  const x = VIEW_W - totalWidth - 10;
  const y = VIEW_H - iconH - 10;

  for (let i = 0; i < magazineSize; i++) {
    const drawX = x + i * (iconW + gap);
    const loaded = i < ammoInMagazine;

    ctx.save();
    ctx.globalAlpha = loaded ? 1 : 0.25;
    ctx.drawImage(icon, drawX, y, iconW, iconH);
    ctx.restore();
  }
}

function getAmmoSpriteKey(weapon) {
  if (weapon === 'sawedoffshotgun') return 'bulletShotgun';
  if (weapon === 'ak47' || weapon === 'm15' || weapon === 'mp5' || weapon === 'm24') return 'bulletRifle';
  return 'bulletPistol';
}

function drawReloadProgress(ctx, state, x = 10, y = 70) {
  const { reloadEndTime, reloadDuration } = state.player;
  const now = Date.now();
  const elapsed = Math.max(0, Math.min(reloadDuration, reloadDuration - (reloadEndTime - now)));
  const progress = reloadDuration > 0 ? elapsed / reloadDuration : 1;

  const w = 120;
  const h = 8;

  ctx.fillStyle = '#1f2937';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(x, y, w * progress, h);
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(x, y, w, h);
}

function drawHearts(ctx, hp) {
  const startX = 10;
  const startY = VIEW_H - 20;
  const heartSize = 12;
  const spacing = 16;
  
  for (let i = 0; i < hp; i++) {
    const x = startX + (i * spacing);
    const y = startY;
    
    // Pixel heart (12x12)
    ctx.fillStyle = '#ef4444';
    
    // Top bumps
    ctx.fillRect(x + 2, y, 3, 2);
    ctx.fillRect(x + 7, y, 3, 2);
    
    // Middle
    ctx.fillRect(x, y + 2, 12, 6);
    
    // Bottom point
    ctx.fillRect(x + 2, y + 8, 8, 2);
    ctx.fillRect(x + 4, y + 10, 4, 2);
  }
}
