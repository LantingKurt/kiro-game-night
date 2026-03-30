export function checkWaveClear(state) {
  if (state.screen !== 'playing') return;
  
  // Check if all enemies are cleared
  if (state.enemies.length === 0) {
    state.screen = 'wave-break';
    state.wave += 1;
    state.waveTimer = 3; // 3 second break
  }
}

export function updateWaveBreak(state, dt) {
  if (state.screen !== 'wave-break') return;
  
  state.waveTimer -= dt;
  
  if (state.waveTimer <= 0) {
    state.screen = 'playing';
    state.waveTimer = 0;
  }
}
