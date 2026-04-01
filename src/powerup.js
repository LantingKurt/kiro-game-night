// Power-Up System for Pixel Survivor
// Provides between-wave upgrade selection with stackable effects

// Power-up definitions with apply functions
export const POWER_UPS = {
  speed: {
    id: 'speed',
    name: 'Speed Boost',
    description: 'Increases movement speed by 40',
    apply: (state) => {
      state.player.speed = Math.min(320, state.player.speed + 40);
    }
  },
  rapidfire: {
    id: 'rapidfire',
    name: 'Rapid Fire',
    description: 'Reduces shoot cooldown by 30%',
    apply: (state) => {
      state.player.shootCooldown = Math.max(80, state.player.shootCooldown * 0.7);
    }
  },
  tripleshot: {
    id: 'tripleshot',
    name: 'Triple Shot',
    description: 'Fire 3 bullets at once',
    apply: (state) => {
      state.powerUps.push({ id: 'tripleshot' });
    }
  },
  bigbullets: {
    id: 'bigbullets',
    name: 'Big Bullets',
    description: 'Larger bullets with bigger damage radius',
    apply: (state) => {
      state.powerUps.push({ id: 'bigbullets' });
    }
  },
  piercing: {
    id: 'piercing',
    name: 'Piercing Shot',
    description: 'Bullets pass through enemies',
    apply: (state) => {
      state.powerUps.push({ id: 'piercing' });
    }
  },
  shield: {
    id: 'shield',
    name: 'Shield',
    description: 'Grants 1 extra life',
    apply: (state) => {
      state.player.hp = Math.min(6, state.player.hp + 1);
    }
  }
};

/**
 * Generate 3 unique random power-up options
 * @param {Object} state - Game state object
 * @postcondition state.powerUpOptions contains exactly 3 unique power-ups
 */
export function generatePowerUpOptions(state) {
  const allPowerUps = Object.values(POWER_UPS);
  const selected = [];
  const available = [...allPowerUps];
  
  while (selected.length < 3 && available.length > 0) {
    const randomIndex = Math.floor(Math.random() * available.length);
    selected.push(available[randomIndex]);
    available.splice(randomIndex, 1);
  }
  
  state.powerUpOptions = selected;
}

/**
 * Handle power-up selection and apply effects
 * @param {Object} state - Game state object
 * @param {number} selectedIndex - Index of selected power-up (0-2)
 * @postcondition Selected power-up applied, screen transitions to 'wave-break'
 */
export function handlePowerUpSelection(state, selectedIndex) {
  // Validate selection index
  if (selectedIndex < 0 || selectedIndex >= state.powerUpOptions.length) {
    // #region agent log
    fetch('http://127.0.0.1:7755/ingest/9bef909d-f044-40bc-bec6-5c825e351d1c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ca820f'},body:JSON.stringify({sessionId:'ca820f',location:'powerup.js:handlePowerUpSelection',message:'INVALID selection index - early return',data:{selectedIndex,optionsLength:state.powerUpOptions.length},hypothesisId:'D',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return; // Invalid selection, ignore
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7755/ingest/9bef909d-f044-40bc-bec6-5c825e351d1c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ca820f'},body:JSON.stringify({sessionId:'ca820f',location:'powerup.js:handlePowerUpSelection',message:'Power-up selected',data:{selectedIndex,waveBeforeIncrement:state.wave,screenBefore:state.screen},hypothesisId:'D',timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const selectedPowerUp = state.powerUpOptions[selectedIndex];
  selectedPowerUp.apply(state);
  
  // Increment wave AFTER power-up selection
  state.wave += 1;
  
  // Transition to wave break
  state.screen = 'wave-break';
  state.waveTimer = 3;
  state.powerUpOptions = [];

  // #region agent log
  fetch('http://127.0.0.1:7755/ingest/9bef909d-f044-40bc-bec6-5c825e351d1c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ca820f'},body:JSON.stringify({sessionId:'ca820f',location:'powerup.js:handlePowerUpSelection',message:'State after power-up selection',data:{wave:state.wave,screen:state.screen,waveTimer:state.waveTimer},hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
  // #endregion
}
