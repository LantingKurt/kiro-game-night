import zombieSheet from '../sprites/zombie/Zombie.png';

import playerIdleS from '../sprites/maincharacter-idle-s.png';
import playerIdleSE from '../sprites/maincharacter-idle-se.png';
import playerIdleNE from '../sprites/maincharacter-idle-ne.png';
import playerIdleN from '../sprites/maincharacter-idle-n.png';
import playerRunS from '../sprites/maincharacter-run-s.png';
import playerRunSE from '../sprites/maincharacter-run-se.png';
import playerRunNE from '../sprites/maincharacter-run-ne.png';
import playerRunN from '../sprites/maincharacter-run-n.png';

import gunAK47 from '../sprites/GunsPack/Guns/AK47.png';
import gunLuger from '../sprites/GunsPack/Guns/Luger.png';
import gunM15 from '../sprites/GunsPack/Guns/M15.png';
import gunM24 from '../sprites/GunsPack/Guns/M24.png';
import gunM92 from '../sprites/GunsPack/Guns/M92.png';
import gunMP5 from '../sprites/GunsPack/Guns/MP5.png';
import gunRevolver from '../sprites/GunsPack/Guns/Revolver.png';
import gunSawedOff from '../sprites/GunsPack/Guns/SawedOffShotgun.png';

import bulletPistol from '../sprites/GunsPack/Bullets/PistolAmmoSmall.png';
import bulletRifle from '../sprites/GunsPack/Bullets/RifleAmmoSmall.png';
import bulletShotgun from '../sprites/GunsPack/Bullets/ShotgunShellSmall.png';

const SPRITE_REGISTRY = {
  zombieSheet:    { src: zombieSheet },
  playerIdleS:    { src: playerIdleS },
  playerIdleSE:   { src: playerIdleSE },
  playerIdleNE:   { src: playerIdleNE },
  playerIdleN:    { src: playerIdleN },
  playerRunS:     { src: playerRunS },
  playerRunSE:    { src: playerRunSE },
  playerRunNE:    { src: playerRunNE },
  playerRunN:     { src: playerRunN },
  ak47:           { src: gunAK47 },
  luger:          { src: gunLuger },
  m15:            { src: gunM15 },
  m24:            { src: gunM24 },
  m92:            { src: gunM92 },
  mp5:            { src: gunMP5 },
  revolver:       { src: gunRevolver },
  sawedoffshotgun:{ src: gunSawedOff },
  bulletPistol:   { src: bulletPistol },
  bulletRifle:    { src: bulletRifle },
  bulletShotgun:  { src: bulletShotgun },
};

export const ZOMBIE_SHEET = {
  frameWidth: 32,
  frameHeight: 32,
  cols: 13,
  rows: 6,
  walkRow: 0,
  walkFrames: 8,
  frameDuration: 100,
};

export const PLAYER_FRAME = { frameWidth: 96, frameHeight: 64 };

export const PLAYER_DIR_ANIMS = {
  idle: {
    s:  { key: 'playerIdleS',  frames: 4, frameDuration: 150 },
    se: { key: 'playerIdleSE', frames: 4, frameDuration: 150 },
    ne: { key: 'playerIdleNE', frames: 4, frameDuration: 150 },
    n:  { key: 'playerIdleN',  frames: 4, frameDuration: 150 },
  },
  run: {
    s:  { key: 'playerRunS',  frames: 8, frameDuration: 100 },
    se: { key: 'playerRunSE', frames: 8, frameDuration: 100 },
    ne: { key: 'playerRunNE', frames: 8, frameDuration: 100 },
    n:  { key: 'playerRunN',  frames: 8, frameDuration: 100 },
  },
};

// Crop region centered on the character within each 96x64 frame
export const PLAYER_CROP = { x: 37, y: 16, w: 24, h: 28 };
export const PLAYER_DRAW_SCALE = 2;

/**
 * Maps an angle (from atan2) to one of 8 directions.
 * Returns { base: 's'|'se'|'ne'|'n', flip: boolean }
 * flip=true means draw mirrored horizontally (for SW, W, NW)
 */
export function angleToDirection(angle) {
  const a = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const sector = Math.floor((a + Math.PI / 8) / (Math.PI / 4)) % 8;

  // sector 0=E, 1=SE, 2=S, 3=SW, 4=W, 5=NW, 6=N, 7=NE
  const DIRS = [
    { base: 'se', flip: false }, // E  → SE sprite
    { base: 'se', flip: false }, // SE
    { base: 's',  flip: false }, // S
    { base: 'se', flip: true  }, // SW → flip SE
    { base: 'se', flip: true  }, // W  → flip SE
    { base: 'ne', flip: true  }, // NW → flip NE
    { base: 'n',  flip: false }, // N
    { base: 'ne', flip: false }, // NE
  ];
  return DIRS[sector];
}

export const GUN_META = {
  luger:          { key: 'luger',          w: 16, h: 16 },
  m92:            { key: 'm92',            w: 16, h: 16 },
  revolver:       { key: 'revolver',       w: 16, h: 16 },
  ak47:           { key: 'ak47',           w: 32, h: 16 },
  m15:            { key: 'm15',            w: 32, h: 16 },
  mp5:            { key: 'mp5',            w: 32, h: 16 },
  sawedoffshotgun:{ key: 'sawedoffshotgun',w: 32, h: 16 },
  m24:            { key: 'm24',            w: 48, h: 16 },
};

const cache = new Map();
let ready = false;

function loadImage(key, src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      cache.set(key, img);
      resolve();
    };
    img.onerror = () => {
      console.warn(`Failed to load sprite: ${key}`);
      resolve();
    };
    img.src = src;
  });
}

export async function preloadAllSprites() {
  const tasks = Object.entries(SPRITE_REGISTRY).map(([key, { src }]) =>
    loadImage(key, src)
  );
  await Promise.all(tasks);
  ready = true;
  console.log(`Sprites loaded: ${cache.size}/${Object.keys(SPRITE_REGISTRY).length}`);
}

export function getSprite(key) {
  return cache.get(key) || null;
}

export function isSpritesReady() {
  return ready;
}

export function getAnimFrame(totalFrames, frameDuration) {
  return Math.floor(Date.now() / frameDuration) % totalFrames;
}
