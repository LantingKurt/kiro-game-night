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

export function handlePowerUpSelection(state, selectedIndex) {
  if (selectedIndex < 0 || selectedIndex >= state.powerUpOptions.length) {
    return;
  }

  const selectedPowerUp = state.powerUpOptions[selectedIndex];
  selectedPowerUp.apply(state);

  state.wave += 1;
  state.screen = 'wave-break';
  state.waveTimer = 3;
  state.powerUpOptions = [];
}
