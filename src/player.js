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

export function drawPlayer(ctx, player, mouseX, mouseY) {
  // Flash effect when invincible (skip drawing every other 0.1s)
  if (player.invincible && Math.floor(player.invTimer * 10) % 2 === 0) {
    return;
  }
  
  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;
  
  // Calculate angle from player to mouse
  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  const angle = Math.atan2(dy, dx);
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);
  
  // Draw sprite centered at origin
  // Body (12x16 torso)
  ctx.fillStyle = '#14b8a6';
  ctx.fillRect(-6, -8, 12, 16);
  
  // Head (12x6)
  ctx.fillStyle = '#5eead4';
  ctx.fillRect(-6, -8, 12, 6);
  
  // Eyes (2x2 each)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-4, -6, 2, 2);
  ctx.fillRect(2, -6, 2, 2);
  
  // Arms (2px wide, 10px long, on sides)
  ctx.fillStyle = '#14b8a6';
  ctx.fillRect(-8, -2, 2, 10);  // left arm
  ctx.fillRect(6, -2, 2, 10);   // right arm
  
  // Legs (2px wide, 8px long)
  ctx.fillRect(-4, 8, 2, 8);    // left leg
  ctx.fillRect(2, 8, 2, 8);     // right leg
  
  ctx.restore();
}
