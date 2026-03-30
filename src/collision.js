function aabbOverlap(a, b) {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
}

export function checkBulletEnemyCollisions(state) {
  const { bullets, enemies } = state;
  
  for (const bullet of bullets) {
    if (!bullet.alive) continue;
    
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      
      if (aabbOverlap(bullet, enemy)) {
        // Check piercing flag before marking bullet as dead
        if (!bullet.piercing) {
          bullet.alive = false;
        }
        enemy.alive = false;
        state.score += 10;
        
        // If not piercing, bullet can only hit one enemy
        if (!bullet.piercing) {
          break;
        }
      }
    }
  }
  
  // Remove dead enemies
  state.enemies = enemies.filter(e => e.alive);
}

export function checkPlayerEnemyCollisions(state) {
  const { player, enemies } = state;
  
  if (player.invincible) return;
  
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    
    if (aabbOverlap(player, enemy)) {
      player.hp -= 1;
      player.invincible = true;
      player.invTimer = 1.5;
      
      if (player.hp <= 0) {
        state.screen = 'gameover';
      }
      
      break; // only one collision per frame
    }
  }
}

export function checkBulletObstacleCollisions(state) {
  const { bullets, obstacles } = state;
  
  for (const bullet of bullets) {
    if (!bullet.alive) continue;
    
    for (const obstacle of obstacles) {
      if (aabbOverlap(bullet, obstacle)) {
        bullet.alive = false;
        break; // bullet can only hit one obstacle
      }
    }
  }
}

export function checkPlayerObstacleCollisions(state) {
  const { player, obstacles } = state;
  
  for (const obstacle of obstacles) {
    if (aabbOverlap(player, obstacle)) {
      // Calculate overlap on each axis
      const overlapX = Math.min(
        player.x + player.width - obstacle.x,
        obstacle.x + obstacle.width - player.x
      );
      const overlapY = Math.min(
        player.y + player.height - obstacle.y,
        obstacle.y + obstacle.height - player.y
      );
      
      // Push back on axis with smallest overlap
      if (overlapX < overlapY) {
        if (player.x < obstacle.x) {
          player.x -= overlapX;
        } else {
          player.x += overlapX;
        }
      } else {
        if (player.y < obstacle.y) {
          player.y -= overlapY;
        } else {
          player.y += overlapY;
        }
      }
    }
  }
}
