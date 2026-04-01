import { WORLD_W, WORLD_H, VIEW_W, VIEW_H } from './camera.js';

export function createGameState() {
  return {
    screen: 'menu',
    wave: 1,
    score: 0,
    camera: {
      x: WORLD_W / 2 - VIEW_W / 2,
      y: WORLD_H / 2 - VIEW_H / 2,
    },
    player: {
      x: WORLD_W / 2 - 8,
      y: WORLD_H / 2 - 8,
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
    enemies: [],
    bullets: [],
    obstacles: [],
    decorations: [],
    powerUps: [],
    powerUpOptions: [],
    keys: new Set(),
    mouse: { x: 0, y: 0 },
    waveTimer: 0
  };
}
