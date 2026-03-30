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
        bullet.alive = false;
        enemy.alive = false;
        state.score += 10;
        break; // bullet can only hit one enemy
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
