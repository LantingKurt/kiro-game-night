export function spawnWave(state) {
  const { wave, enemies } = state;
  
  // Wave formula
  const enemyCount = 3 + (wave * 2);
  const enemySpeed = 60 + (wave * 8);
  
  enemies.length = 0; // Clear existing enemies
  
  for (let i = 0; i < enemyCount; i++) {
    const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    let x, y;
    
    switch (edge) {
      case 0: // top
        x = Math.random() * 640;
        y = 0;
        break;
      case 1: // right
        x = 640 - 14;
        y = Math.random() * 480;
        break;
      case 2: // bottom
        x = Math.random() * 640;
        y = 480 - 14;
        break;
      case 3: // left
        x = 0;
        y = Math.random() * 480;
        break;
    }
    
    enemies.push({
      x,
      y,
      speed: enemySpeed,
      width: 14,
      height: 14,
      alive: true
    });
  }
}

export function updateEnemies(state, dt) {
  const { player, enemies } = state;
  const playerCenterX = player.x + player.width / 2;
  const playerCenterY = player.y + player.height / 2;
  
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    
    const enemyCenterX = enemy.x + enemy.width / 2;
    const enemyCenterY = enemy.y + enemy.height / 2;
    
    // Direction toward player
    const dx = playerCenterX - enemyCenterX;
    const dy = playerCenterY - enemyCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
      // Normalized direction * speed * dt
      enemy.x += (dx / dist) * enemy.speed * dt;
      enemy.y += (dy / dist) * enemy.speed * dt;
    }
  }
}

export function drawEnemies(ctx, enemies) {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    
    const x = Math.floor(enemy.x);
    const y = Math.floor(enemy.y);
    
    // Coral/red body
    ctx.fillStyle = '#f87171';
    ctx.fillRect(x, y, 14, 14);
    
    // Darker border (2px on each side)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x, y, 14, 2); // top
    ctx.fillRect(x, y + 12, 14, 2); // bottom
    ctx.fillRect(x, y, 2, 14); // left
    ctx.fillRect(x + 12, y, 2, 14); // right
  }
}
