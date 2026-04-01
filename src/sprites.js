import zombieSheet from '../sprites/zombie/Zombie.png';
import playerIdle from '../sprites/maincharacter-idle.png';
import playerRun from '../sprites/maincharacter-run.png';
import playerAttack from '../sprites/maincharacter-attack.png';

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
  zombieSheet:   { src: zombieSheet },
  playerIdle:    { src: playerIdle },
  playerRun:     { src: playerRun },
  playerAttack:  { src: playerAttack },
  ak47:          { src: gunAK47 },
  luger:         { src: gunLuger },
  m15:           { src: gunM15 },
  m24:           { src: gunM24 },
  m92:           { src: gunM92 },
  mp5:           { src: gunMP5 },
  revolver:      { src: gunRevolver },
  sawedoffshotgun: { src: gunSawedOff },
  bulletPistol:  { src: bulletPistol },
  bulletRifle:   { src: bulletRifle },
  bulletShotgun: { src: bulletShotgun },
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

export const PLAYER_ANIMS = {
  idle:   { key: 'playerIdle',   frameWidth: 96, frameHeight: 64, frames: 9,  frameDuration: 150 },
  run:    { key: 'playerRun',    frameWidth: 96, frameHeight: 64, frames: 8,  frameDuration: 100 },
  attack: { key: 'playerAttack', frameWidth: 96, frameHeight: 64, frames: 10, frameDuration: 80  },
};

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
