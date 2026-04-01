import { createGameState } from './state.js';
import { updatePlayer, drawPlayer } from './player.js';
import { updateEnemies, drawEnemies, spawnWave } from './enemy.js';
import { updateBullets, drawBullets } from './bullet.js';
import { checkBulletEnemyCollisions, checkPlayerEnemyCollisions, checkBulletObstacleCollisions, checkPlayerObstacleCollisions } from './collision.js';
import { checkWaveClear, updateWaveBreak } from './wave.js';
import { drawHUD } from './hud.js';
import { drawMenu, drawWaveBreak, drawGameOver, drawLeaderboard, drawPowerUpScreen } from './screens.js';
import { submitScore, getLeaderboard } from './supabase.js';
import { handlePowerUpSelection } from './powerup.js';
import { generateObstacles, drawObstacles, drawPaths } from './obstacle.js';
import { preloadAllSprites, GUN_META } from './sprites.js';
import { preloadAudio, playGunShot, playReload, startZombieAmbience, stopZombieAmbience } from './audio.js';
import { WORLD_W, WORLD_H, VIEW_W, VIEW_H, updateCamera, screenToWorld } from './camera.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;

const state = createGameState();
let lastTime = 0;
let playerNameInput = '';
let muzzleFlashTimer = 0;
let prevScreen = 'menu';

const TILE = 32;
let grassPattern = null;

function buildGrassTile() {
  const tc = document.createElement('canvas');
  tc.width = TILE;
  tc.height = TILE;
  const t = tc.getContext('2d');

  t.fillStyle = '#2d5a1e';
  t.fillRect(0, 0, TILE, TILE);

  const seeded = (x, y, m) => ((x * 2654435761 + y * 40503) ^ m) >>> 0;

  for (let py = 0; py < TILE; py += 2) {
    for (let px = 0; px < TILE; px += 2) {
      const h = seeded(px, py, 7919) % 100;
      if (h < 30) {
        t.fillStyle = '#346b23';
        t.fillRect(px, py, 2, 2);
      } else if (h < 50) {
        t.fillStyle = '#264e18';
        t.fillRect(px, py, 2, 2);
      } else if (h < 58) {
        t.fillStyle = '#3a7a2a';
        t.fillRect(px, py, 1, 2);
      } else if (h < 62) {
        t.fillStyle = '#1f4212';
        t.fillRect(px, py, 2, 1);
      }
    }
  }

  for (let py = 0; py < TILE; py += 4) {
    for (let px = 0; px < TILE; px += 4) {
      const v = seeded(px, py, 131) % 100;
      if (v < 8) {
        t.fillStyle = '#4a8f35';
        t.fillRect(px + 1, py, 1, 3);
      } else if (v < 12) {
        t.fillStyle = '#3e7828';
        t.fillRect(px, py + 1, 1, 2);
      }
    }
  }

  return tc;
}

function initGrassPattern() {
  const tile = buildGrassTile();
  grassPattern = ctx.createPattern(tile, 'repeat');
}

function drawGround(ctx, cam) {
  if (!grassPattern) initGrassPattern();
  ctx.fillStyle = grassPattern;
  const x0 = Math.floor(cam.x / TILE) * TILE;
  const y0 = Math.floor(cam.y / TILE) * TILE;
  const x1 = Math.min(cam.x + VIEW_W + TILE, WORLD_W);
  const y1 = Math.min(cam.y + VIEW_H + TILE, WORLD_H);
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
}

function drawWorldBorder(ctx) {
  ctx.strokeStyle = '#1a3a10';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, WORLD_W, WORLD_H);
  ctx.strokeStyle = '#4a8f35';
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, WORLD_W - 2, WORLD_H - 2);
}

// Input handling
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  state.keys.add(key);

  // Pause/unpause with P
  if (state.screen === 'playing' && key === 'p') {
    state.paused = !state.paused;
    if (state.paused) {
      stopZombieAmbience();
    } else {
      startZombieAmbience();
    }
    return;
  }
  // Manual reload while playing when magazine is not full.
  if (state.screen === 'playing' && key === 'r') {
    if (state.player.ammoInMagazine < state.player.magazineSize && !state.player.isReloading) {
      startReload(state.player, Date.now());
    }
  }
  
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

// Pause when window loses focus, unpause on focus (optional: only unpause if not manually paused)
window.addEventListener('blur', () => {
  if (state.screen === 'playing' && !state.paused) {
    state.paused = true;
    stopZombieAmbience();
  }
});
window.addEventListener('focus', () => {
  // Do not auto-unpause if user paused manually
  // Optionally, you could set a flag to distinguish manual vs auto pause
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  state.mouse.x = e.clientX - rect.left;
  state.mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('click', (e) => {
  if (state.screen === 'playing') {
    updateReloadState(state);
    fireBullet(state);
  } else if (state.screen === 'menu') {
    state.screen = 'playing';
    state.wave = 1;
    state.score = 0;
    state.player.x = WORLD_W / 2 - 8;
    state.player.y = WORLD_H / 2 - 8;
    state.player.hp = 3;
    state.player.invincible = false;
    state.player.invTimer = 0;
    state.player.shootCooldown = 200;
    state.player.lastShotTime = 0;
    state.player.magazineSize = 10;
    state.player.ammoInMagazine = state.player.magazineSize;
    state.player.isReloading = false;
    state.player.reloadDuration = 1200;
    state.player.reloadEndTime = 0;
    state.player.moving = false;
    state.bullets = [];
    state.powerUps = [];
    state.camera.x = WORLD_W / 2 - VIEW_W / 2;
    state.camera.y = WORLD_H / 2 - VIEW_H / 2;
    generateObstacles(state);
    spawnWave(state);
    playReload();
    startZombieAmbience();
  } else if (state.screen === 'powerup-selection') {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cardW = 170, cardH = 190, gap = 18;
    const totalW = cardW * 3 + gap * 2;
    const sx = (VIEW_W - totalW) / 2;
    const sy = 110;

    if (y >= sy && y <= sy + cardH) {
      for (let i = 0; i < 3; i++) {
        const cx = sx + i * (cardW + gap);
        if (x >= cx && x < cx + cardW) {
          handlePowerUpSelection(state, i);
          break;
        }
      }
    }
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
  const { player, mouse, bullets, powerUps, camera } = state;
  const now = Date.now();

  if (player.isReloading) {
    return;
  }

  if (player.ammoInMagazine <= 0) {
    return;
  }

  if (now - player.lastShotTime < player.shootCooldown) {
    return;
  }

  player.lastShotTime = now;

  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;

  const worldMouse = screenToWorld(mouse.x, mouse.y, camera);
  const dx = worldMouse.x - centerX;
  const dy = worldMouse.y - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return;

  const baseAngle = Math.atan2(dy, dx);
  const speed = 400;

  const gunMeta = GUN_META[player.currentWeapon];
  const muzzleDist = 10 + (gunMeta ? gunMeta.w * 1.2 : 12);
  const muzzleX = centerX + Math.cos(baseAngle) * muzzleDist;
  const muzzleY = centerY + Math.sin(baseAngle) * muzzleDist;
  
  const hasTripleShot = powerUps.some(p => p.id === 'tripleshot');
  const hasBigBullets = powerUps.some(p => p.id === 'bigbullets');
  const hasPiercing = powerUps.some(p => p.id === 'piercing');
  
  const angles = hasTripleShot 
    ? [baseAngle - 0.26, baseAngle, baseAngle + 0.26]
    : [baseAngle];
  
  for (const angle of angles) {
    const bulletSize = hasBigBullets ? 8 : 4;
    
    bullets.push({
      x: muzzleX - bulletSize / 2,
      y: muzzleY - bulletSize / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      width: bulletSize,
      height: bulletSize,
      alive: true,
      piercing: hasPiercing,
      damage: hasBigBullets ? 2 : 1
    });
  }

  player.ammoInMagazine -= 1;
  
  muzzleFlashTimer = 0.05;
  playGunShot();
}

function startReload(player, now) {
  if (player.isReloading) return;
  player.isReloading = true;
  player.reloadEndTime = now + player.reloadDuration;
  playReload();
}

function updateReloadState(state) {
  const { player } = state;
  if (!player.isReloading) return;

  const now = Date.now();
  if (now >= player.reloadEndTime) {
    player.isReloading = false;
    player.ammoInMagazine = player.magazineSize;
  }
}

// Game loop
function gameLoop(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000; // convert to seconds
  lastTime = currentTime;

  updateReloadState(state);

  if (prevScreen !== state.screen) {
    if (state.screen === 'gameover' || state.screen === 'menu') {
      stopZombieAmbience();
    }
    prevScreen = state.screen;
  }

  ctx.fillStyle = '#0f1a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  const cam = state.camera;
  const worldMouse = screenToWorld(state.mouse.x, state.mouse.y, cam);

  if (state.screen === 'menu') {
    drawMenu(ctx, canvas);
  } else if (state.screen === 'playing') {
    if (!state.paused) {
      updatePlayer(state, deltaTime);
      updateEnemies(state, deltaTime);
      updateBullets(state, deltaTime);
      updateCamera(cam, state.player);

      if (muzzleFlashTimer > 0) {
        muzzleFlashTimer -= deltaTime;
      }

      checkBulletObstacleCollisions(state);
      checkPlayerObstacleCollisions(state);
      checkBulletEnemyCollisions(state);
      checkPlayerEnemyCollisions(state);
      checkWaveClear(state);
    }

    ctx.save();
    ctx.translate(-cam.x, -cam.y);

    drawGround(ctx, cam);
    drawPaths(ctx, state.decorations);
    drawWorldBorder(ctx);
    drawObstacles(ctx, state.obstacles);
    drawPlayer(ctx, state.player, worldMouse.x, worldMouse.y);
    drawEnemies(ctx, state.enemies);
    drawBullets(ctx, state.bullets);

    if (muzzleFlashTimer > 0 && !state.paused) {
      const cx = state.player.x + state.player.width / 2;
      const cy = state.player.y + state.player.height / 2;
      const fdx = worldMouse.x - cx;
      const fdy = worldMouse.y - cy;
      const fdist = Math.sqrt(fdx * fdx + fdy * fdy);

      if (fdist > 0) {
        const gunM = GUN_META[state.player.currentWeapon];
        const flashDist = 10 + (gunM ? gunM.w * 1.2 : 12) + 2;
        const flashX = cx + (fdx / fdist) * flashDist;
        const flashY = cy + (fdy / fdist) * flashDist;

        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(flashX - 1, flashY - 1, 3, 3);
      }
    }

    ctx.restore();

    drawHUD(ctx, state);

    // Draw pause overlay
    if (state.paused) {
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
      ctx.font = '20px monospace';
      ctx.fillText('Press P to resume', canvas.width / 2, canvas.height / 2 + 40);
      ctx.restore();
    }
  } else if (state.screen === 'powerup-selection') {
    drawPowerUpScreen(ctx, state);
  } else if (state.screen === 'wave-break') {
    updateWaveBreak(state, deltaTime);

    if (state.screen === 'playing') {
      // Start each round with a full magazine.
      state.player.isReloading = false;
      state.player.reloadEndTime = 0;
      state.player.ammoInMagazine = state.player.magazineSize;
      generateObstacles(state);
      spawnWave(state);
      playReload();
    } else {
      ctx.save();
      ctx.translate(-cam.x, -cam.y);

      drawGround(ctx, cam);
      drawPaths(ctx, state.decorations);
      drawWorldBorder(ctx);
      drawObstacles(ctx, state.obstacles);
      drawPlayer(ctx, state.player, worldMouse.x, worldMouse.y);
      drawBullets(ctx, state.bullets);

      ctx.restore();

      drawHUD(ctx, state);
      drawWaveBreak(ctx, state);
    }
  } else if (state.screen === 'gameover') {
    drawGameOver(ctx, state, playerNameInput);
  } else if (state.screen === 'leaderboard') {
    drawLeaderboard(ctx, state.leaderboardData || []);
  }
  
  requestAnimationFrame(gameLoop);
}

Promise.all([preloadAllSprites(), preloadAudio()]).then(() => {
  console.log('Assets loaded, starting game loop');
  requestAnimationFrame((time) => {
    lastTime = time;
    requestAnimationFrame(gameLoop);
  });
}).catch(() => {
  console.warn('Asset loading had issues, starting with fallback rendering');
  requestAnimationFrame((time) => {
    lastTime = time;
    requestAnimationFrame(gameLoop);
  });
});

console.log('Pixel Survivor initialized');
