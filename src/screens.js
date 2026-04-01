export function drawMenu(ctx, canvas) {
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PIXEL SURVIVOR', 320, 150);

  ctx.font = '16px monospace';
  ctx.fillText('Click to Start', 320, 250);
  ctx.fillText('Press Space for Leaderboard', 320, 280);

  ctx.font = '14px monospace';
  ctx.fillText('WASD to move, Mouse to aim, Click to shoot', 320, 350);
  ctx.textAlign = 'left';
}

export function drawWaveBreak(ctx, state) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, 640, 480);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`WAVE ${state.wave} INCOMING`, 320, 220);
  ctx.fillText(`${Math.ceil(state.waveTimer)}`, 320, 260);
  ctx.textAlign = 'left';
}

export function drawGameOver(ctx, state, playerNameInput = '') {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, 640, 480);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', 320, 150);

  ctx.font = '20px monospace';
  ctx.fillText(`Final Score: ${state.score}`, 320, 200);
  ctx.fillText(`Wave Reached: ${state.wave}`, 320, 230);

  ctx.font = '16px monospace';
  ctx.fillText('Enter your name:', 320, 280);

  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(220, 290, 200, 30);
  ctx.fillText(playerNameInput || '_', 320, 312);

  ctx.fillText('Press ENTER or Click to submit', 320, 360);
  ctx.textAlign = 'left';
}

export function drawLeaderboard(ctx, leaderboardData) {
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LEADERBOARD', 320, 50);

  ctx.font = '14px monospace';
  ctx.textAlign = 'left';

  if (!leaderboardData || leaderboardData.length === 0) {
    ctx.textAlign = 'center';
    ctx.fillText('No scores yet!', 320, 150);
  } else {
    for (let i = 0; i < Math.min(10, leaderboardData.length); i++) {
      const entry = leaderboardData[i];
      const y = 100 + (i * 30);
      ctx.fillText(`${i + 1}.`, 50, y);
      ctx.fillText(entry.player_name, 100, y);
      ctx.fillText(`${entry.score}`, 400, y);
      ctx.fillText(`Wave ${entry.wave_reached}`, 500, y);
    }
  }

  ctx.textAlign = 'center';
  ctx.fillText('Press ESC to return to menu', 320, 450);
  ctx.textAlign = 'left';
}

const POWERUP_COLORS = {
  speed:     { accent: '#34d399', bg: '#064e3b' },
  rapidfire: { accent: '#fbbf24', bg: '#78350f' },
  tripleshot:{ accent: '#f97316', bg: '#7c2d12' },
  bigbullets:{ accent: '#f87171', bg: '#7f1d1d' },
  piercing:  { accent: '#60a5fa', bg: '#1e3a5f' },
  shield:    { accent: '#f472b6', bg: '#831843' },
};

const POWERUP_ICONS = {
  speed: drawIconSpeed,
  rapidfire: drawIconRapidFire,
  tripleshot: drawIconTripleShot,
  bigbullets: drawIconBigBullets,
  piercing: drawIconPiercing,
  shield: drawIconShield,
};

export function drawPowerUpScreen(ctx, state) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, 640, 480);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CHOOSE AN UPGRADE', 320, 80);

  const cardW = 170;
  const cardH = 190;
  const gap = 18;
  const totalW = cardW * 3 + gap * 2;
  const startX = (640 - totalW) / 2;
  const startY = 110;

  const mx = state.mouse.x;
  const my = state.mouse.y;

  for (let i = 0; i < state.powerUpOptions.length && i < 3; i++) {
    const powerUp = state.powerUpOptions[i];
    const px = startX + i * (cardW + gap);
    const py = startY;
    const colors = POWERUP_COLORS[powerUp.id] || { accent: '#94a3b8', bg: '#1e293b' };

    const hovered = mx >= px && mx < px + cardW && my >= py && my < py + cardH;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px, py, cardW, cardH);

    ctx.fillStyle = hovered ? colors.accent : '#334155';
    ctx.fillRect(px, py, cardW, 2);
    ctx.fillRect(px, py + cardH - 2, cardW, 2);
    ctx.fillRect(px, py, 2, cardH);
    ctx.fillRect(px + cardW - 2, py, 2, cardH);

    if (hovered) {
      ctx.fillStyle = colors.accent + '18';
      ctx.fillRect(px + 2, py + 2, cardW - 4, cardH - 4);
    }

    ctx.fillStyle = colors.bg;
    ctx.fillRect(px + 2, py + 2, cardW - 4, 2);

    const iconX = px + cardW / 2;
    const iconY = py + 40;
    const drawIcon = POWERUP_ICONS[powerUp.id];
    if (drawIcon) {
      drawIcon(ctx, iconX, iconY, colors.accent);
    }

    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(powerUp.name, px + cardW / 2, py + 80);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    const words = powerUp.description.split(' ');
    let line = '';
    let yOff = 102;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > cardW - 24 && line !== '') {
        ctx.fillText(line.trim(), px + cardW / 2, py + yOff);
        line = word + ' ';
        yOff += 16;
      } else {
        line = test;
      }
    }
    ctx.fillText(line.trim(), px + cardW / 2, py + yOff);

    if (hovered) {
      ctx.fillStyle = colors.accent;
      ctx.font = 'bold 11px monospace';
      ctx.fillText('[ SELECT ]', px + cardW / 2, py + cardH - 16);
    }
  }

  ctx.fillStyle = '#475569';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Choose a Power-Up', 320, startY + cardH + 30);
  ctx.textAlign = 'left';
}

function drawIconSpeed(ctx, cx, cy, color) {
  ctx.fillStyle = color;
  ctx.fillRect(cx - 8, cy - 2, 6, 4);
  ctx.fillRect(cx - 2, cy - 4, 4, 8);
  ctx.fillRect(cx + 4, cy - 2, 6, 4);
  ctx.fillRect(cx + 2, cy - 6, 4, 2);
  ctx.fillRect(cx + 2, cy + 4, 4, 2);
  ctx.fillRect(cx + 8, cy - 4, 2, 8);
}

function drawIconRapidFire(ctx, cx, cy, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < 3; i++) {
    const x = cx - 8 + i * 8;
    ctx.fillRect(x, cy - 6 - i * 2, 3, 3);
    ctx.fillRect(x, cy + 0, 3, 3);
    ctx.fillRect(x, cy + 6 + i * 2, 3, 3);
  }
}

function drawIconTripleShot(ctx, cx, cy, color) {
  ctx.fillStyle = color;
  ctx.fillRect(cx - 1, cy - 8, 2, 16);
  ctx.fillRect(cx - 7, cy - 4, 2, 12);
  ctx.fillRect(cx + 5, cy - 4, 2, 12);
  ctx.fillRect(cx - 3, cy + 6, 6, 2);
  ctx.fillRect(cx - 5, cy + 4, 2, 2);
  ctx.fillRect(cx + 3, cy + 4, 2, 2);
}

function drawIconBigBullets(ctx, cx, cy, color) {
  ctx.fillStyle = color;
  ctx.fillRect(cx - 5, cy - 3, 10, 6);
  ctx.fillRect(cx - 3, cy - 5, 6, 10);
  ctx.fillRect(cx - 4, cy - 4, 8, 8);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cx - 2, cy - 2, 4, 4);
  ctx.fillStyle = color;
  ctx.fillRect(cx - 1, cy - 1, 2, 2);
}

function drawIconPiercing(ctx, cx, cy, color) {
  ctx.fillStyle = color;
  ctx.fillRect(cx - 10, cy - 1, 20, 2);
  ctx.fillRect(cx + 6, cy - 3, 2, 2);
  ctx.fillRect(cx + 6, cy + 1, 2, 2);
  ctx.fillStyle = '#475569';
  ctx.fillRect(cx - 6, cy - 4, 4, 8);
  ctx.fillRect(cx + 0, cy - 4, 4, 8);
  ctx.fillStyle = color;
  ctx.fillRect(cx - 5, cy - 3, 2, 6);
  ctx.fillRect(cx + 1, cy - 3, 2, 6);
}

function drawIconShield(ctx, cx, cy, color) {
  ctx.fillStyle = color;
  ctx.fillRect(cx - 6, cy - 7, 12, 2);
  ctx.fillRect(cx - 8, cy - 5, 16, 2);
  ctx.fillRect(cx - 8, cy - 3, 16, 4);
  ctx.fillRect(cx - 7, cy + 1, 14, 2);
  ctx.fillRect(cx - 5, cy + 3, 10, 2);
  ctx.fillRect(cx - 3, cy + 5, 6, 2);
  ctx.fillRect(cx - 1, cy + 7, 2, 2);
}
