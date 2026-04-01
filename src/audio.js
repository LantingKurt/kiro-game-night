import gunShotSrc from '../sounds/gun shot.mp3';
import reloadSrc from '../sounds/reload.mp3';
import zombieSrc from '../sounds/zombie sounds.mp3';

let audioCtx = null;
let gunShotBuffer = null;
let reloadBuffer = null;
let zombieBuffer = null;
let zombieSource = null;
let zombieGain = null;
let ready = false;

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
  gain.gain.value = 0.35;
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
  gain.gain.value = 0.4;
  src.buffer = reloadBuffer;
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

export function startZombieAmbience() {
  if (!ready || !zombieBuffer || !zombieGain) return;
  ensureResumed();

  if (zombieSource) {
    try { zombieSource.stop(); } catch (_) { /* already stopped */ }
  }

  const ctx = getAudioContext();
  zombieSource = ctx.createBufferSource();
  zombieSource.buffer = zombieBuffer;
  zombieSource.loop = true;
  zombieSource.connect(zombieGain);
  zombieGain.gain.setTargetAtTime(0.08, ctx.currentTime, 0.3);
  zombieSource.start();
}

export function stopZombieAmbience() {
  if (!zombieGain || !audioCtx) return;
  zombieGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
  setTimeout(() => {
    if (zombieSource) {
      try { zombieSource.stop(); } catch (_) { /* already stopped */ }
      zombieSource = null;
    }
  }, 2000);
}
