import { createGameState } from './state.js';
import { updatePlayer, drawPlayer } from './player.js';
import { updateEnemies, drawEnemies } from './enemy.js';
import { updateBullets, drawBullets } from './bullet.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = createGameState();
let lastTime = 0;

// Input handling
window.addEventListener('keydown', (e) => {
  state.keys.add(e.key.toLowerCase());
});

window.addEventListener('keyup', (e) => {
  state.keys.delete(e.key.toLowerCase());
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  state.mouse.x = e.clientX - rect.left;
  state.mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('click', () => {
  if (state.screen === 'playing') {
    fireBullet(state);
  }
});

function fireBullet(state) {
  const { player, mouse, bullets } = state;
  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;
  
  const dx = mouse.x - centerX;
  const dy = mouse.y - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist > 0) {
    const speed = 400;
    bullets.push({
      x: centerX - 2,
      y: centerY - 2,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      width: 4,
      height: 4,
      alive: true
    });
  }
}

// Game loop
function gameLoop(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000; // convert to seconds
  lastTime = currentTime;
  
  // Clear canvas
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Update and render based on screen state
  if (state.screen === 'playing') {
    updatePlayer(state, deltaTime);
    updateEnemies(state, deltaTime);
    updateBullets(state, deltaTime);
    
    drawPlayer(ctx, state.player);
    drawEnemies(ctx, state.enemies);
    drawBullets(ctx, state.bullets);
  }
  
  requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame((time) => {
  lastTime = time;
  requestAnimationFrame(gameLoop);
});

console.log('Pixel Survivor initialized');
