# Pixel Survivor

A top-down zombie survival game built with vanilla JavaScript and HTML5 Canvas.

Survive waves of zombies, collect power-ups, and climb the leaderboard.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`).

## How to Play

| Input | Action |
|-------|--------|
| **WASD** | Move |
| **Mouse** | Aim |
| **Left Click** | Shoot |
| **R** | Reload |
| **Space** (menu) | View leaderboard |
| **Escape** (leaderboard) | Return to menu |

- Click anywhere on the menu screen to start a game.
- Kill all zombies in a wave to advance.
- After each wave, pick one of three power-ups.
- Survive as long as you can — your score is based on zombie kills.

### Power-ups

| Power-up | Effect |
|----------|--------|
| Speed Boost | Move faster |
| Rapid Fire | Shorter cooldown between shots |
| Triple Shot | Fire three bullets in a spread |
| Big Bullets | Larger, higher-damage projectiles |
| Piercing | Bullets pass through enemies |
| Shield | Gain extra HP |

## Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

Output is written to the `dist/` folder.

## Project Structure

```
src/
  main.js        Game loop, rendering, input handling
  state.js       Game state initialization
  camera.js      Camera system and world/viewport constants
  player.js      Player movement and drawing
  enemy.js       Zombie spawning, AI, and drawing
  bullet.js      Bullet updates and drawing
  obstacle.js    Environment generation (walls, houses, trees, bushes, paths)
  collision.js   AABB collision detection
  wave.js        Wave progression logic
  powerup.js     Power-up definitions and application
  hud.js         Score, wave, and HP display
  screens.js     Menu, game over, leaderboard, and power-up selection screens
  sprites.js     Sprite loading, animation, and metadata
  audio.js       Sound effect loading and playback
  supabase.js    Leaderboard backend integration
sprites/         Sprite assets (zombie, guns, main character)
sounds/          Audio assets (gunshot, reload, zombie ambience)
```
