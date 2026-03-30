# Implementation Plan: Game Upgrades v1

## Overview

This implementation plan breaks down the Game Upgrades v1 feature into discrete coding tasks. The feature adds player sprite rotation, zombie-themed enemies, a power-up selection system, and obstacle generation with collision detection. Tasks are organized to build incrementally, with early validation through testing sub-tasks.

## Tasks

- [ ] 1. Extend game state and initialize new properties
  - Modify `src/state.js` to add new state properties: obstacles array, powerUps array, powerUpOptions array, player.shootCooldown (200ms), player.lastShotTime (0)
  - Add piercing and damage properties to bullet structure documentation
  - Add colorTint property to enemy structure documentation
  - _Requirements: 8.2, 8.3_

- [ ] 2. Implement player sprite rotation
  - [ ] 2.1 Update drawPlayer() function in src/player.js
    - Modify function signature to accept mouseX and mouseY parameters
    - Calculate rotation angle using Math.atan2(mouseY - centerY, mouseX - centerX)
    - Implement canvas transformation: save(), translate(), rotate(), restore()
    - Redraw player sprite centered at origin with body, head, eyes, arms, legs
    - Maintain invincibility flash effect
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 2.2 Write property test for player rotation
    - **Property 1: Player Rotation Correctness**
    - **Validates: Requirements 1.1**
  
  - [ ] 2.3 Update main.js to pass mouse coordinates to drawPlayer()
    - Modify drawPlayer() calls to include state.mouse.x and state.mouse.y
    - _Requirements: 1.1_

- [ ] 3. Implement zombie enemy sprites with animation
  - [ ] 3.1 Update spawnWave() in src/enemy.js to assign colorTint
    - Add colorTint property to each spawned enemy (random value 0-2)
    - _Requirements: 2.1_
  
  - [ ] 3.2 Rewrite drawEnemies() function for zombie sprites
    - Calculate shamble offset using Math.sin(Date.now() / 200) * 2
    - Select body color based on enemy.colorTint (dark green, olive, grey-green)
    - Draw zombie body (12x14), oversized head (14x8), outstretched arms (18x2)
    - Draw legs with shamble animation offset
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 3.3 Write property tests for zombie sprites
    - **Property 10: Zombie Color Variation**
    - **Property 11: Shamble Animation Synchronization**
    - **Validates: Requirements 2.1, 2.3, 2.4**

- [ ] 4. Create obstacle system module
  - [ ] 4.1 Create src/obstacle.js with generateObstacles() function
    - Implement wave-based obstacle count logic (wave 1-2: 3, wave 3-5: 5, wave 6+: 7)
    - Implement random placement with safe zone enforcement (80px from spawn point 320, 240)
    - Ensure obstacles are within canvas bounds (0 <= x <= 600, 0 <= y <= 440)
    - Add placement attempt limit (100 tries per obstacle)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_
  
  - [ ] 4.2 Add drawObstacles() function to src/obstacle.js
    - Render 40x40 pixel obstacles as stacked brick rectangles
    - Use alternating grey shades for brick pattern
    - _Requirements: 4.6_
  
  - [ ]* 4.3 Write property tests for obstacle generation
    - **Property 4: Obstacle Safe Zone**
    - **Property 5: Obstacle Count by Wave**
    - **Property 6: Obstacle Bounds**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.7**

- [ ] 5. Checkpoint - Verify visual updates
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement obstacle collision detection
  - [ ] 6.1 Add checkBulletObstacleCollisions() to src/collision.js
    - Implement AABB overlap detection for bullets and obstacles
    - Mark bullets as dead when hitting obstacles (including piercing bullets)
    - _Requirements: 5.1, 5.4, 5.5_
  
  - [ ] 6.2 Add checkPlayerObstacleCollisions() to src/collision.js
    - Implement AABB overlap detection for player and obstacles
    - Resolve collision by pushing player back on axis with smallest overlap
    - _Requirements: 5.2, 5.3, 5.5_
  
  - [ ]* 6.3 Write property tests for obstacle collision
    - **Property 7: Bullet-Obstacle Collision**
    - **Property 8: Player-Obstacle Collision Resolution**
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 7. Implement enemy obstacle avoidance
  - [ ] 7.1 Update updateEnemies() in src/enemy.js
    - Add obstacle avoidance steering logic
    - Calculate repulsion force for enemies within 60px of obstacles
    - Combine player pursuit direction with obstacle avoidance vectors
    - Normalize final movement vector before applying speed
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 7.2 Write property test for enemy steering
    - **Property 12: Enemy Obstacle Steering**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [ ] 8. Create power-up system module
  - [ ] 8.1 Create src/powerup.js with POWER_UPS definitions
    - Define all 6 power-ups: Speed Boost, Rapid Fire, Triple Shot, Big Bullets, Piercing Shot, Shield
    - Implement apply() functions with stacking limits (speed max 320, cooldown min 80ms, hp max 6)
    - _Requirements: 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11_
  
  - [ ] 8.2 Add generatePowerUpOptions() function
    - Implement random selection of 3 unique power-ups
    - Store selected options in state.powerUpOptions
    - _Requirements: 3.2_
  
  - [ ] 8.3 Add handlePowerUpSelection() function
    - Validate selectedIndex (0-2 range)
    - Apply selected power-up to state
    - Transition screen to 'wave-break'
    - Clear powerUpOptions array
    - _Requirements: 3.3, 3.4_
  
  - [ ]* 8.4 Write property tests for power-up system
    - **Property 2: Power-Up Uniqueness**
    - **Property 3: Power-Up Stacking Limits**
    - **Validates: Requirements 3.2, 3.6, 3.7, 3.8**

- [ ] 9. Implement power-up selection screen
  - [ ] 9.1 Add drawPowerUpScreen() to src/screens.js
    - Render 3 power-up cards with name and description
    - Position cards at y=200, spaced 200px apart horizontally
    - _Requirements: 7.1, 7.4_
  
  - [ ] 9.2 Add power-up click detection to main.js
    - Detect clicks on power-up cards based on mouse coordinates
    - Call handlePowerUpSelection() with correct index
    - Ignore clicks outside card boundaries
    - _Requirements: 7.2, 7.3_
  
  - [ ]* 9.3 Write property test for click detection
    - **Property 13: Power-Up Click Detection**
    - **Validates: Requirements 7.2**

- [ ] 10. Checkpoint - Verify power-up system
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Update shooting mechanics with power-up effects
  - [ ] 11.1 Refactor fireBullet() in main.js
    - Add cooldown check using Date.now() and player.lastShotTime
    - Check for active power-ups (tripleshot, bigbullets, piercing)
    - Implement triple shot with 15-degree angle spread (±0.26 radians)
    - Set bullet size based on bigbullets power-up (4x4 or 8x8)
    - Set bullet piercing flag and damage value
    - _Requirements: 3.7, 3.9, 3.10, 3.11_
  
  - [ ]* 11.2 Write property test for triple shot
    - **Property 9: Triple Shot Angle Spread**
    - **Validates: Requirements 3.9**

- [ ] 12. Update bullet-enemy collision for piercing
  - [ ] 12.1 Modify checkBulletEnemyCollisions() in src/collision.js
    - Check bullet.piercing flag before marking bullet as dead
    - Keep bullet alive if piercing is true
    - _Requirements: 3.11_

- [ ] 13. Integrate wave progression with power-up screen
  - [ ] 13.1 Update checkWaveClear() in src/wave.js
    - Change screen transition to 'powerup-selection' instead of 'wave-break'
    - Call generatePowerUpOptions() when wave clears
    - _Requirements: 3.1, 8.4_
  
  - [ ] 13.2 Update main.js game loop for new screen state
    - Add rendering case for 'powerup-selection' screen
    - Call drawPowerUpScreen() when screen is 'powerup-selection'
    - _Requirements: 8.3_

- [ ] 14. Integrate obstacle generation into wave start
  - [ ] 14.1 Update main.js wave break logic
    - Call generateObstacles() when wave break ends and playing screen starts
    - Ensure obstacles are generated before spawnWave()
    - _Requirements: 8.2_
  
  - [ ] 14.2 Add obstacle collision checks to game loop
    - Call checkBulletObstacleCollisions() after updateBullets()
    - Call checkPlayerObstacleCollisions() after updatePlayer()
    - _Requirements: 8.3_
  
  - [ ] 14.3 Add obstacle rendering to game loop
    - Call drawObstacles() during 'playing' and 'wave-break' screens
    - Render obstacles before player and enemies
    - _Requirements: 8.3_

- [ ] 15. Final integration and wiring
  - [ ] 15.1 Import new modules in main.js
    - Add imports for powerup.js and obstacle.js functions
    - _Requirements: 8.1_
  
  - [ ] 15.2 Verify all screen transitions work correctly
    - Test flow: playing → powerup-selection → wave-break → playing
    - Ensure obstacles persist across wave break
    - _Requirements: 8.4_
  
  - [ ]* 15.3 Write integration tests
    - Test full wave cycle with power-up selection
    - Test obstacle interaction with bullets, player, and enemies
    - Test power-up stacking across multiple waves

- [ ] 16. Final checkpoint - Complete testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Integration tests validate end-to-end flows
- All code uses vanilla JavaScript with Canvas API (no frameworks)
- Existing game systems (scoring, leaderboard, wave progression) remain unchanged
