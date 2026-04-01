import { generatePowerUpOptions } from './powerup.js';

export function checkWaveClear(state) {
  if (state.screen !== 'playing') return;
  
  // Check if all enemies are cleared
  if (state.enemies.length === 0) {
    // #region agent log
    fetch('http://127.0.0.1:7755/ingest/9bef909d-f044-40bc-bec6-5c825e351d1c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ca820f'},body:JSON.stringify({sessionId:'ca820f',location:'wave.js:checkWaveClear',message:'Wave cleared! Transitioning to powerup-selection',data:{wave:state.wave,enemiesLength:state.enemies.length},hypothesisId:'C,E',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    state.screen = 'powerup-selection';
    // Don't increment wave yet - do it after power-up selection
    state.waveTimer = 3; // 3 second break
    
    // Generate power-up options
    generatePowerUpOptions(state);
  }
}

export function updateWaveBreak(state, dt) {
  if (state.screen !== 'wave-break') return;
  
  state.waveTimer -= dt;
  
  if (state.waveTimer <= 0) {
    state.screen = 'playing';
    state.waveTimer = 0;
    // #region agent log
    fetch('http://127.0.0.1:7755/ingest/9bef909d-f044-40bc-bec6-5c825e351d1c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ca820f'},body:JSON.stringify({sessionId:'ca820f',location:'wave.js:updateWaveBreak',message:'Wave break ended, transitioning to playing',data:{wave:state.wave,enemiesCount:state.enemies.length},hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }
}
