export function updatePlayer(state, dt) {
  const { player, keys } = state;
  
  // WASD movement
  let vx = 0;
  let vy = 0;
  
  if (keys.has('w')) vy -= 1;
  if (keys.has('s')) vy += 1;
  if (keys.has('a')) vx -= 1;
  if (keys.has('d')) vx += 1;
  
  // Normalize diagonal movement
  if (vx !== 0 && vy !== 0) {
    const len = Math.sqrt(vx * vx + vy * vy);
    vx /= len;
    vy /= len;
  }
  
  // Apply velocity
  player.x += vx * player.speed * dt;
  player.y += vy * player.speed * dt;
  
  // Clamp to canvas bounds
  player.x = Math.max(0, Math.min(640 - player.width, player.x));
  player.y = Math.max(0, Math.min(480 - player.height, player.y));
  
  // Invincibility timer countdown
  if (player.invincible) {
    player.invTimer -= dt;
    if (player.invTimer <= 0) {
      player.invincible = false;
      player.invTimer = 0;
    }
  }
}

export function drawPlayer(ctx, player) {
  // Flash effect when invincible (skip drawing every other 0.1s)
  if (player.invincible && Math.floor(player.invTimer * 10) % 2 === 0) {
    return;
  }
  
  const x = Math.floor(player.x);
  const y = Math.floor(player.y);
  
  // Teal body (12x16)
  ctx.fillStyle = '#14b8a6';
  ctx.fillRect(x + 2, y, 12, 16);
  
  // Lighter head (12x6)
  ctx.fillStyle = '#5eead4';
  ctx.fillRect(x + 2, y, 12, 6);
  
  // Dark eye dots (2x2 each)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 4, y + 2, 2, 2);
  ctx.fillRect(x + 10, y + 2, 2, 2);
}
