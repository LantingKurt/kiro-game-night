import { VIEW_W, VIEW_H } from './camera.js';

export function drawHUD(ctx, state) {
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px monospace';

  ctx.fillText(`Score: ${state.score}`, 10, 20);

  const waveText = `Wave: ${state.wave}`;
  const waveWidth = ctx.measureText(waveText).width;
  ctx.fillText(waveText, VIEW_W - waveWidth - 10, 20);

  drawHearts(ctx, state.player.hp);
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
