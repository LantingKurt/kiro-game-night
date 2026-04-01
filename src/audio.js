import gunShotSrc from '../sounds/gun shot.mp3';
import reloadSrc from '../sounds/reload.mp3';
import zombieSrc from '../sounds/zombie sounds.mp3';

const GUNSHOT_VOLUME = 0.22;
const RELOAD_VOLUME = 0.3;
const ZOMBIE_AMBIENCE_VOLUME = 0.14;

let audioCtx = null;
let gunShotBuffer = null;
let reloadBuffer = null;
let zombieBuffer = null;
let zombieSource = null;
let zombieGain = null;
let ready = false;
let shouldStartZombieAmbience = false;
let zombieStopTimer = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

async function loadBuffer(url) {
  const resp = await fetch(url);
  const arrayBuf = await resp.arrayBuffer();
  return getAudioContext().decodeAudioData(arrayBuf);
}

export async function preloadAudio() {
  try {
    const ctx = getAudioContext();
    [gunShotBuffer, reloadBuffer, zombieBuffer] = await Promise.all([
      loadBuffer(gunShotSrc),
      loadBuffer(reloadSrc),
      loadBuffer(zombieSrc),
    ]);

    zombieGain = ctx.createGain();
    zombieGain.gain.value = 0;
    zombieGain.connect(ctx.destination);

    ready = true;

    // If game start requested ambience before audio finished loading, start now.
    if (shouldStartZombieAmbience) {
      startZombieAmbience();
    }

    console.log('Audio loaded');
  } catch (e) {
    console.warn('Audio loading failed:', e);
  }
}

function ensureResumed() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function playGunShot() {
  if (!ready || !gunShotBuffer) return;
  ensureResumed();
  const ctx = getAudioContext();
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  gain.gain.value = GUNSHOT_VOLUME;
  src.buffer = gunShotBuffer;
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

export function playReload() {
  if (!ready || !reloadBuffer) return;
  ensureResumed();
  const ctx = getAudioContext();
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  gain.gain.value = RELOAD_VOLUME;
  src.buffer = reloadBuffer;
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

export function startZombieAmbience() {
  shouldStartZombieAmbience = true;
  if (!ready || !zombieBuffer || !zombieGain) return;
  ensureResumed();

  if (zombieStopTimer) {
    clearTimeout(zombieStopTimer);
    zombieStopTimer = null;
  }

  if (zombieSource) {
    try { zombieSource.stop(); } catch (_) { /* already stopped */ }
  }

  const ctx = getAudioContext();
  zombieSource = ctx.createBufferSource();
  zombieSource.buffer = zombieBuffer;
  zombieSource.loop = true;
  zombieSource.connect(zombieGain);
  zombieGain.gain.setTargetAtTime(ZOMBIE_AMBIENCE_VOLUME, ctx.currentTime, 0.3);
  zombieSource.start();
}

export function stopZombieAmbience() {
  shouldStartZombieAmbience = false;
  if (!zombieGain || !audioCtx) return;

  if (zombieStopTimer) {
    clearTimeout(zombieStopTimer);
    zombieStopTimer = null;
  }

  zombieGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
  zombieStopTimer = setTimeout(() => {
    if (zombieSource) {
      try { zombieSource.stop(); } catch (_) { /* already stopped */ }
      zombieSource = null;
    }
    zombieStopTimer = null;
  }, 2000);
}
