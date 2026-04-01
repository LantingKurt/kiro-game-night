export function createGameState() {
  return {
    screen: 'menu', // 'menu' | 'playing' | 'wave-break' | 'gameover' | 'leaderboard' | 'powerup-selection'
    wave: 1,
    score: 0,
    player: {
      x: 320 - 8, // centered
      y: 240 - 8,
      speed: 180,
      hp: 3,
      invincible: false,
      invTimer: 0,
      width: 16,
      height: 16,
      shootCooldown: 200,
      lastShotTime: 0,
      currentWeapon: 'luger',
      moving: false,
    },
    enemies: [],  // Each enemy has: x, y, speed, width, height, alive, colorTint (0-2 for color variation)
    bullets: [],  // Each bullet has: x, y, vx, vy, width, height, alive, piercing (boolean), damage (number)
    obstacles: [],  // Each obstacle has: x, y, width, height
    powerUps: [],  // Active power-ups: { id, name, description }
    powerUpOptions: [],  // Current power-up selection choices
    keys: new Set(),
    mouse: { x: 0, y: 0 },
    waveTimer: 0
  };
}
