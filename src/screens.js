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
