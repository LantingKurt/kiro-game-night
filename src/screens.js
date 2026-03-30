export function drawMenu(ctx, canvas) {
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  
  // Title
  ctx.fillText('PIXEL SURVIVOR', 320, 150);
  
  // Instructions
  ctx.font = '16px monospace';
  ctx.fillText('Click to Start', 320, 250);
  ctx.fillText('Press Space for Leaderboard', 320, 280);
  
  // Controls
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
  
  // Name input box
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
export function drawPowerUpScreen(ctx, state) {
  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, 640, 480);
  
  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CHOOSE YOUR UPGRADE', 320, 100);
  
  // Draw 3 power-up cards
  const cardPositions = [
    { x: 20, y: 180 },
    { x: 220, y: 180 },
    { x: 420, y: 180 }
  ];
  
  const cardWidth = 180;
  const cardHeight = 140;
  
  for (let i = 0; i < state.powerUpOptions.length && i < 3; i++) {
    const powerUp = state.powerUpOptions[i];
    const pos = cardPositions[i];
    
    // Card background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(pos.x, pos.y, cardWidth, cardHeight);
    
    // Card border
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(pos.x, pos.y, cardWidth, cardHeight);
    
    // Power-up name
    ctx.fillStyle = '#14b8a6';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(powerUp.name, pos.x + cardWidth / 2, pos.y + 40);
    
    // Power-up description (word wrap)
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px monospace';
    const words = powerUp.description.split(' ');
    let line = '';
    let yOffset = 70;
    const maxWidth = cardWidth - 20;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line.trim(), pos.x + cardWidth / 2, pos.y + yOffset);
        line = word + ' ';
        yOffset += 18;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), pos.x + cardWidth / 2, pos.y + yOffset);
  }
  
  // Instructions
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Click on a card to select', 320, 380);
  
  ctx.textAlign = 'left';
}
