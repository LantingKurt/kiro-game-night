import { createGameState } from './state.js';
import { updatePlayer, drawPlayer } from './player.js';
import { updateEnemies, drawEnemies, spawnWave } from './enemy.js';
import { updateBullets, drawBullets } from './bullet.js';
import { checkBulletEnemyCollisions, checkPlayerEnemyCollisions } from './collision.js';
import { checkWaveClear, updateWaveBreak } from './wave.js';
import { drawHUD } from './hud.js';
import { drawMenu, drawWaveBreak, drawGameOver, drawLeaderboard } from './screens.js';
import { submitScore, getLeaderboard } from './supabase.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = createGameState();
let lastTime = 0;
let playerNameInput = '';
let muzzleFlashTimer = 0;

function drawPixelGrid(ctx) {
  ctx.strokeStyle = '#161b22';
  ctx.lineWidth = 1;
  
  // Vertical lines
  for (let x = 0; x <= 640; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 480);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = 0; y <= 480; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(640, y);
    ctx.stroke();
  }
}

// Input handling
window.addEventListener('keydown', (e) => {
  state.keys.add(e.key.toLowerCase());
  
  // Handle name input on game over screen
  if (state.screen === 'gameover') {
    if (e.key === 'Enter' && playerNameInput.trim()) {
      handleScoreSubmit();
    } else if (e.key === 'Backspace') {
      playerNameInput = playerNameInput.slice(0, -1);
    } else if (e.key.length === 1 && playerNameInput.length < 20) {
      playerNameInput += e.key;
    }
  }
  
  // Space to view leaderboard from menu
  if (state.screen === 'menu' && e.key === ' ') {
    loadLeaderboard();
  }
  
  // ESC to return to menu from leaderboard
  if (state.screen === 'leaderboard' && e.key === 'Escape') {
    state.screen = 'menu';
  }
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
  } else if (state.screen === 'menu') {
    state.screen = 'playing';
    spawnWave(state);
  } else if (state.screen === 'gameover' && playerNameInput.trim()) {
    handleScoreSubmit();
  }
});

async function handleScoreSubmit() {
  const name = playerNameInput.trim() || 'Anonymous';
  await submitScore(name, state.score, state.wave);
  playerNameInput = '';
  await loadLeaderboard();
}

async function loadLeaderboard() {
  const data = await getLeaderboard();
  state.leaderboardData = data;
  state.screen = 'leaderboard';
}

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
    
    // Trigger muzzle flash
    muzzleFlashTimer = 0.05; // 1 frame at 60fps
  }
}

// Game loop
function gameLoop(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000; // convert to seconds
  lastTime = currentTime;
  
  // Clear canvas
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw pixel grid background
  drawPixelGrid(ctx);
  
  // Update and render based on screen state
  if (state.screen === 'menu') {
    drawMenu(ctx, canvas);
  } else if (state.screen === 'playing') {
    updatePlayer(state, deltaTime);
    updateEnemies(state, deltaTime);
    updateBullets(state, deltaTime);
    
    // Update muzzle flash timer
    if (muzzleFlashTimer > 0) {
      muzzleFlashTimer -= deltaTime;
    }
    
    checkBulletEnemyCollisions(state);
    checkPlayerEnemyCollisions(state);
    checkWaveClear(state);
    
    drawPlayer(ctx, state.player, state.mouse.x, state.mouse.y);
    drawEnemies(ctx, state.enemies);
    drawBullets(ctx, state.bullets);
    
    // Draw muzzle flash
    if (muzzleFlashTimer > 0) {
      const centerX = state.player.x + state.player.width / 2;
      const centerY = state.player.y + state.player.height / 2;
      const dx = state.mouse.x - centerX;
      const dy = state.mouse.y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        const flashDist = 12;
        const flashX = centerX + (dx / dist) * flashDist;
        const flashY = centerY + (dy / dist) * flashDist;
        
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(flashX - 3, flashY - 3, 6, 6);
      }
    }
    
    drawHUD(ctx, state);
  } else if (state.screen === 'wave-break') {
    updateWaveBreak(state, deltaTime);
    
    // Spawn wave when break ends
    if (state.screen === 'playing') {
      spawnWave(state);
    }
    
    // Still draw player and bullets during break
    drawPlayer(ctx, state.player, state.mouse.x, state.mouse.y);
    drawBullets(ctx, state.bullets);
    drawHUD(ctx, state);
    drawWaveBreak(ctx, state);
  } else if (state.screen === 'gameover') {
    drawGameOver(ctx, state, playerNameInput);
  } else if (state.screen === 'leaderboard') {
    drawLeaderboard(ctx, state.leaderboardData || []);
  }
  
  requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame((time) => {
  lastTime = time;
  requestAnimationFrame(gameLoop);
});

console.log('Pixel Survivor initialized');
