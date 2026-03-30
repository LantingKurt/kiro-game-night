export function createGameState() {
  return {
    screen: 'menu', // 'menu' | 'playing' | 'wave-break' | 'gameover' | 'leaderboard'
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
      height: 16
    },
    enemies: [],
    bullets: [],
    keys: new Set(),
    mouse: { x: 0, y: 0 },
    waveTimer: 0
  };
}
