# Project Structure

## Module Organization

The codebase follows a modular architecture with clear separation of concerns:

```
src/
├── main.js         - Game loop, input handling, screen orchestration
├── state.js        - Game state initialization
├── player.js       - Player update and rendering
├── enemy.js        - Enemy spawning, update, and rendering
├── bullet.js       - Bullet update and rendering
├── collision.js    - AABB collision detection
├── wave.js         - Wave progression and break timing
├── hud.js          - In-game UI (score, lives, wave counter)
├── screens.js      - Menu, game over, leaderboard, wave break screens
└── supabase.js     - Backend integration (submit/fetch leaderboard)
```

## Module Responsibilities

- **main.js**: Entry point, game loop with delta time, input listeners, screen state management
- **state.js**: Creates initial game state object (player, enemies, bullets, keys, mouse, screen)
- **player.js**: Movement (WASD), invincibility timer, pixel art rendering
- **enemy.js**: Wave spawning formula, pathfinding toward player, rendering
- **bullet.js**: Firing from player toward mouse, velocity-based movement, bounds checking
- **collision.js**: AABB overlap detection for bullet-enemy and player-enemy
- **wave.js**: Wave clear detection, wave break countdown, wave increment
- **hud.js**: Score, wave number, heart icons
- **screens.js**: Menu, game over (name input), leaderboard display, wave break countdown
- **supabase.js**: Client initialization, score submission, top 10 leaderboard fetch

## Data Flow

1. `main.js` creates state via `state.js`
2. Game loop calls update functions (player, enemies, bullets)
3. Collision detection modifies state (score, hp, alive flags)
4. Wave management transitions between screens
5. Rendering functions draw based on current state

## Conventions

- All positions in pixels (x, y)
- All speeds in pixels per second
- Delta time in seconds for frame-rate independence
- Entity alive/dead tracked with boolean flags
- Screen state: 'menu' | 'playing' | 'wave-break' | 'gameover' | 'leaderboard'
