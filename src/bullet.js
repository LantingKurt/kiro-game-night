export function updateBullets(state, dt) {
  const { bullets } = state;
  
  for (const bullet of bullets) {
    if (!bullet.alive) continue;
    
    // Move bullet
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    
    // Mark out-of-bounds bullets as dead
    if (bullet.x < 0 || bullet.x > 640 || bullet.y < 0 || bullet.y > 480) {
      bullet.alive = false;
    }
  }
  
  // Remove dead bullets
  state.bullets = bullets.filter(b => b.alive);
}

export function drawBullets(ctx, bullets) {
  ctx.fillStyle = '#fbbf24'; // bright amber
  
  for (const bullet of bullets) {
    if (!bullet.alive) continue;
    
    const x = Math.floor(bullet.x);
    const y = Math.floor(bullet.y);
    
    ctx.fillRect(x, y, 4, 4);
  }
}
