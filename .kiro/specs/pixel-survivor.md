# Pixel Survivor — Kiro Spec

## Requirements

REQ-1: Player moves in 8 directions using WASD keys on a 640x480 canvas. Movement is smooth and frame-rate independent using delta time.

REQ-2: Player aims and shoots toward the mouse cursor position. Clicking fires a bullet. Bullets travel in a straight line and despawn when they leave the canvas or hit an enemy.

REQ-3: Enemies spawn at random positions on the canvas edges at the start of each wave. Each wave spawns more enemies than the last. Wave number is displayed on screen.

REQ-4: Enemies move toward the player at a constant speed that increases slightly each wave. Enemies are destroyed when hit by a bullet.

REQ-5: Player has 3 lives represented by pixel heart icons in the HUD. Colliding with an enemy removes 1 life. Losing all lives triggers Game Over.

REQ-6: Score increments by 10 per enemy killed. Score is displayed live in the HUD and shown on the Game Over screen.

REQ-7: A brief invincibility window (1.5 seconds) activates after the player takes damage. Player sprite flashes during this window.

REQ-8: A short pause between waves (3 seconds) shows a "Wave X incoming" message before enemies spawn.

REQ-9: On Game Over, the player is prompted to enter their name. The score and name are submitted to a Supabase leaderboard table.

REQ-10: A leaderboard screen shows the top 10 scores fetched from Supabase, accessible from the main menu and after submitting a score.

## Design

### Data Structures

Player: { x, y, speed: 180, hp: 3, invincible: false, invTimer: 0, width: 16, height: 16 }
Enemy: { x, y, speed, width: 14, height: 14, alive: true }
Bullet: { x, y, vx, vy, width: 4, height: 4, alive: true }
GameState: { screen: 'menu'|'playing'|'wave-break'|'gameover'|'leaderboard', wave: 1, score: 0, player, enemies[], bullets[], keys: Set, mouse: {x,y}, waveTimer: 0 }

### Pixel Art Rendering
All sprites drawn with ctx.fillRect() — no image files needed.
Player sprite (16x16): teal body + lighter head + dark eye dots.
Enemy sprite (14x14): coral/red body + darker border.
Bullet (4x4): bright amber square.
Background: dark navy (#0d1117) with 32x32 pixel grid.

### Module Structure
src/main.js, state.js, player.js, enemy.js, bullet.js, collision.js, hud.js, screens.js, supabase.js

### Wave Formula
enemyCount = 3 + (wave * 2)
enemySpeed = 60 + (wave * 8)
waveBreakDuration = 3 seconds

### Supabase Schema
Table: leaderboard
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY
  player_name text NOT NULL
  score int4 NOT NULL
  wave_reached int4 NOT NULL
  created_at timestamptz DEFAULT now()
RLS: SELECT and INSERT both open to anon role.

### Collision Detection
AABB: overlap = !(a.x+a.w < b.x || b.x+b.w < a.x || a.y+a.h < b.y || b.y+b.h < a.y)

## Tasks

TASK 1 — Project setup
- npm create vite@latest . -- --template vanilla
- npm install @supabase/supabase-js
- Create .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- index.html with centered <canvas id="game"> (640x480)
- Dark body background (#0d1117)

TASK 2 — Game state and loop
- createGameState() returning full GameState
- requestAnimationFrame loop with delta time
- keydown/keyup → state.keys Set
- mousemove → state.mouse relative to canvas
- click → fireBullet(state)

TASK 3 — Player module
- updatePlayer: WASD velocity * dt, clamp to bounds, invTimer countdown
- drawPlayer: ctx.fillRect pixel art, flash effect when invincible

TASK 4 — Enemy module
- spawnWave: count and speed from wave formula, spawn on canvas edges
- updateEnemies: move toward player using normalized direction * speed * dt
- drawEnemies: coral squares with darker border

TASK 5 — Bullet module
- fireBullet: direction from player center to mouse, normalized, speed 400px/s
- updateBullets: move by vx*dt/vy*dt, mark out-of-bounds bullets dead

TASK 6 — Collision module
- checkBulletEnemyCollisions: AABB, on hit enemy.alive=false, score+=10
- checkPlayerEnemyCollisions: on hit and not invincible, hp-=1, invincible=true, invTimer=1.5, gameover if hp=0

TASK 7 — Wave management
- checkWaveClear: if enemies empty and playing → wave-break, wave++, waveTimer=3
- In loop: count down waveTimer, when 0 → spawnWave, playing

TASK 8 — HUD and screens
- drawHUD: score top-left, wave top-right, hearts bottom-left
- drawMenu: title, start, leaderboard
- drawWaveBreak: "WAVE X INCOMING" + countdown
- drawGameOver: score, name input, submit button

TASK 9 — Supabase integration
- supabase.js: createClient from env
- submitScore(name, score, wave): insert into leaderboard
- getLeaderboard(): top 10 by score DESC
- Wire Game Over submit → submitScore → load leaderboard screen

TASK 10 — Polish and deploy
- Pixel grid background
- Muzzle flash on shoot (1 frame)
- vite.config.js base path for GitHub Pages
- GitHub Actions deploy workflow
- Add secrets to repo (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)