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
      alive: true,
      colorTint: Math.floor(Math.random() * 3) // Random value 0-2
    });
  }
}

export function updateEnemies(state, dt) {
  const { player, enemies, obstacles } = state;
  const playerCenterX = player.x + player.width / 2;
  const playerCenterY = player.y + player.height / 2;
  
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    
    const enemyCenterX = enemy.x + enemy.width / 2;
    const enemyCenterY = enemy.y + enemy.height / 2;
    
    // Base direction toward player
    let dx = playerCenterX - enemyCenterX;
    let dy = playerCenterY - enemyCenterY;
    
    // Apply obstacle avoidance steering
    if (obstacles) {
      for (const obstacle of obstacles) {
        const obstacleCenterX = obstacle.x + obstacle.width / 2;
        const obstacleCenterY = obstacle.y + obstacle.height / 2;
        
        const obstDx = enemyCenterX - obstacleCenterX;
        const obstDy = enemyCenterY - obstacleCenterY;
        const obstDist = Math.sqrt(obstDx * obstDx + obstDy * obstDy);
        
        // Apply repulsion if within 60px
        if (obstDist < 60 && obstDist > 0) {
          const repulsionStrength = (60 - obstDist) / 60;
          dx += (obstDx / obstDist) * repulsionStrength * 100;
          dy += (obstDy / obstDist) * repulsionStrength * 100;
        }
      }
    }
    
    // Normalize and apply movement
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      enemy.x += (dx / dist) * enemy.speed * dt;
      enemy.y += (dy / dist) * enemy.speed * dt;
    }
  }
}

export function drawEnemies(ctx, enemies) {
  // Calculate shamble offset for leg animation (shared across all zombies)
  const shambleOffset = Math.sin(Date.now() / 200) * 2;
  
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    
    const x = Math.floor(enemy.x);
    const y = Math.floor(enemy.y);
    
    // Select body color based on enemy.colorTint (0-2)
    const colors = ['#2d5016', '#4a5d23', '#3d4a3a'];
    const bodyColor = colors[enemy.colorTint % 3];
    
    // Body (12x14 torso)
    ctx.fillStyle = bodyColor;
    ctx.fillRect(x + 1, y + 4, 12, 14);
    
    // Head (14x8, larger than body)
    ctx.fillStyle = '#3d5a1f';
    ctx.fillRect(x, y, 14, 8);
    
    // Outstretched arms (18x2)
    ctx.fillStyle = bodyColor;
    ctx.fillRect(x - 2, y + 6, 18, 2);
    
    // Legs with shamble animation offset (2px wide each)
    ctx.fillRect(x + 3, y + 14 + shambleOffset, 2, 6);
    ctx.fillRect(x + 9, y + 14 - shambleOffset, 2, 6);
  }
}
