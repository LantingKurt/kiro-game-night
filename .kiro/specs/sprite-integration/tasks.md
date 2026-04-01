# Implementation Plan: Sprite Integration

## Overview

This plan implements sprite image rendering for the Pixel Survivor game, replacing procedural `ctx.fillRect()` rendering with actual PNG sprites while maintaining the retro pixel art aesthetic and existing game mechanics. The implementation includes a centralized sprite loader, modifications to entity renderers, and graceful fallback to procedural rendering.

## Tasks

- [ ] 1. Export maincharacter.aseprite to PNG
  - Run Aseprite export command to generate sprites/maincharacter.png from sprites/maincharacter.aseprite
  - Verify PNG file is created in sprites/ directory
  - _Requirements: 5.1, 5.2_

- [ ] 2. Create sprite loader module (src/sprites.js)
  - [ ] 2.1 Implement SpriteLoader class with preloadAll(), getSprite(), and isReady() methods
    - Create sprite registry mapping keys to Vite asset paths (zombie, player, weapon sprites)
    - Implement sprite cache using Map<string, HTMLImageElement>
    - Use Vite static imports for all sprite paths
    - _Requirements: 1.1, 1.2, 1.3, 10.2_
  
  - [ ] 2.2 Implement error handling for sprite loading failures
    - Handle image onerror events gracefully (log warning, cache null, don't reject)
    - Add Aseprite file detection (.aseprite → .png path resolution)
    - _Requirements: 1.4, 5.2, 5.3, 7.1, 7.2_
  
  - [ ]* 2.3 Write property test for sprite cache consistency
    - **Property 1: Sprite Cache Consistency**
    - **Validates: Requirements 1.2, 1.3**
  
  - [ ]* 2.4 Write property test for graceful null sprite handling
    - **Property 13: Graceful Null Sprite Handling**
    - **Validates: Requirements 7.4**

- [ ] 3. Configure canvas for pixel art rendering (src/main.js)
  - [ ] 3.1 Disable image smoothing on canvas context
    - Set imageSmoothingEnabled = false (all vendor prefixes)
    - Apply configuration before game loop starts
    - _Requirements: 1.6, 8.1_
  
  - [ ] 3.2 Initialize sprite loader and preload assets
    - Create SpriteLoader instance
    - Call preloadAll() before starting game loop
    - Wait for isReady() before allowing gameplay
    - _Requirements: 1.5, 6.1, 6.2_

- [ ] 4. Checkpoint - Verify sprite loader works
  - Ensure sprite loader preloads successfully, ask the user if questions arise.

- [ ] 5. Modify enemy renderer to use sprites (src/enemy.js)
  - [ ] 5.1 Update drawEnemies() to accept spriteLoader parameter
    - Add spriteLoader parameter to function signature
    - Get zombie sprite using spriteLoader.getSprite('zombie')
    - _Requirements: 2.1, 2.2_
  
  - [ ] 5.2 Implement sprite rendering with ctx.drawImage()
    - Draw zombie sprite at floored coordinates (Math.floor(x), Math.floor(y))
    - Scale sprite to 14x14 to match enemy hitbox
    - Apply shamble animation offset using ctx.translate()
    - _Requirements: 2.3, 2.6, 8.5_
  
  - [ ] 5.3 Implement color tint variation using composite operations
    - Apply color tint for enemy.colorTint > 0 using globalCompositeOperation 'multiply'
    - Use existing tint colors array ['#2d5016', '#4a5d23', '#3d4a3a']
    - Reset composite operation to 'source-over' after tinting
    - _Requirements: 2.4_
  
  - [ ] 5.4 Preserve fallback to fillRect rendering
    - Keep existing fillRect rendering code in else block when sprite is null
    - _Requirements: 2.5, 7.1_
  
  - [ ]* 5.5 Write property test for enemy sprite dimensions
    - **Property 2: Enemy Sprite Dimensions**
    - **Validates: Requirements 2.3**
  
  - [ ]* 5.6 Write property test for color tint application
    - **Property 3: Color Tint Application**
    - **Validates: Requirements 2.4**
  
  - [ ]* 5.7 Write property test for shamble animation preservation
    - **Property 4: Shamble Animation Preservation**
    - **Validates: Requirements 2.6**
  
  - [ ]* 5.8 Write property test for pixel-perfect coordinate flooring
    - **Property 15: Pixel-Perfect Coordinate Flooring**
    - **Validates: Requirements 8.5**

- [ ] 6. Modify player renderer to use sprites (src/player.js)
  - [ ] 6.1 Update drawPlayer() to accept spriteLoader parameter
    - Add spriteLoader parameter to function signature
    - Get player sprite using spriteLoader.getSprite('player')
    - _Requirements: 3.1_
  
  - [ ] 6.2 Implement sprite rendering with rotation
    - Draw player sprite centered at origin (-8, -8) with 16x16 dimensions
    - Maintain existing rotation logic (ctx.rotate(angle))
    - _Requirements: 3.2, 3.3_
  
  - [ ] 6.3 Preserve invincibility flash effect
    - Keep existing flash logic (skip rendering when Math.floor(invTimer * 10) % 2 === 0)
    - _Requirements: 3.4_
  
  - [ ] 6.4 Preserve fallback to fillRect rendering
    - Keep existing fillRect rendering code in else block when sprite is null
    - _Requirements: 3.5, 7.1_
  
  - [ ]* 6.5 Write property test for player rotation alignment
    - **Property 5: Player Rotation Alignment**
    - **Validates: Requirements 3.2**
  
  - [ ]* 6.6 Write property test for player sprite dimensions
    - **Property 6: Player Sprite Dimensions**
    - **Validates: Requirements 3.3**
  
  - [ ]* 6.7 Write property test for invincibility flash preservation
    - **Property 7: Invincibility Flash Preservation**
    - **Validates: Requirements 3.4**

- [ ] 7. Add weapon sprite rendering (src/player.js)
  - [ ] 7.1 Create drawWeapon() helper function
    - Accept ctx, player, mouseX, mouseY, spriteLoader parameters
    - Calculate rotation angle same as player
    - Position weapon with offset (weaponOffsetX = 8, weaponOffsetY = 0)
    - _Requirements: 4.2, 4.3_
  
  - [ ] 7.2 Implement weapon sprite selection and rendering
    - Get weapon sprite using player.currentWeapon or default to 'luger'
    - Draw weapon sprite scaled to 16x8 (half of original ~32x16)
    - Render weapon on top of player sprite
    - _Requirements: 4.1, 4.4, 4.5, 4.6_
  
  - [ ] 7.3 Call drawWeapon() from drawPlayer() after player sprite
    - Ensure weapon renders after player sprite (layering)
    - _Requirements: 4.4_
  
  - [ ]* 7.4 Write property test for weapon position offset
    - **Property 8: Weapon Position Offset**
    - **Validates: Requirements 4.2**
  
  - [ ]* 7.5 Write property test for weapon rotation alignment
    - **Property 9: Weapon Rotation Alignment**
    - **Validates: Requirements 4.3**
  
  - [ ]* 7.6 Write property test for weapon sprite selection
    - **Property 10: Weapon Sprite Selection**
    - **Validates: Requirements 4.5**
  
  - [ ]* 7.7 Write property test for weapon aspect ratio preservation
    - **Property 11: Weapon Aspect Ratio Preservation**
    - **Validates: Requirements 4.6**

- [ ] 8. Add currentWeapon to player state (src/state.js)
  - [ ] 8.1 Add currentWeapon: 'luger' property to player object
    - Initialize with default weapon 'luger'
    - _Requirements: 4.5_

- [ ] 9. Checkpoint - Verify rendering works
  - Ensure all sprites render correctly with fallbacks, ask the user if questions arise.

- [ ] 10. Wire sprite loader into main.js game loop
  - [ ] 10.1 Pass spriteLoader to all rendering functions
    - Update drawPlayer() call to include spriteLoader parameter
    - Update drawEnemies() call to include spriteLoader parameter
    - _Requirements: 6.3_
  
  - [ ]* 10.2 Write property test for cached image reference usage
    - **Property 12: Cached Image Reference Usage**
    - **Validates: Requirements 6.3**

- [ ] 11. Test in development environment
  - [ ] 11.1 Run npm run dev and verify sprites load correctly
    - Check browser console for sprite loading logs
    - Verify no 404 errors for sprite assets
    - Confirm sprites render with pixel-perfect appearance
    - _Requirements: 8.3, 8.4, 8.5, 10.4_
  
  - [ ] 11.2 Test fallback rendering by temporarily breaking sprite paths
    - Verify game remains playable with fillRect rendering
    - Confirm warning messages logged to console
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ]* 11.3 Write property test for integer scaling preference
    - **Property 14: Integer Scaling Preference**
    - **Validates: Requirements 8.2**

- [ ] 12. Test production build
  - [ ] 12.1 Run npm run build and verify sprite assets bundled
    - Check dist/assets/ directory contains sprite PNGs
    - Verify Vite rewrites sprite import paths correctly
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ] 12.2 Run npm run preview and test production build locally
    - Verify sprites load correctly from dist/assets/
    - Confirm no console errors or 404s
    - Test game performance maintains 60 FPS
    - _Requirements: 6.5, 10.4, 10.5_
  
  - [ ]* 12.3 Write property test for environment-independent path resolution
    - **Property 16: Environment-Independent Path Resolution**
    - **Validates: Requirements 10.4**

- [ ] 13. Final checkpoint - Complete integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The sprite loader uses Vite's static import system for proper bundling
- Fallback rendering ensures the game remains playable if sprites fail to load
- Canvas image smoothing must be disabled to preserve pixel art aesthetic
