# Design Document: Sprite Integration

## Overview

This design specifies the integration of actual sprite image assets into the Pixel Survivor game, replacing the current procedural `ctx.fillRect()` rendering with image-based rendering. The implementation will maintain the retro pixel art aesthetic, preserve existing game mechanics, and provide graceful fallback to procedural rendering when sprites fail to load.

The sprite integration will be implemented through a centralized sprite loader module that handles asset loading, caching, and Vite integration. Each entity renderer (player, enemy, weapon) will be modified to use `ctx.drawImage()` with loaded sprites while maintaining backward compatibility with the existing fillRect rendering as a fallback.

Key design goals:
- Zero impact on game performance (maintain 60 FPS)
- Preserve existing animation effects (shambling, invincibility flash)
- Maintain pixel-perfect rendering with no image smoothing
- Graceful degradation when sprites unavailable
- Seamless integration with Vite's asset bundling system

## Architecture

### Module Structure

```
src/
├── sprites.js          (NEW) - Sprite loader and cache management
├── player.js           (MODIFIED) - Add sprite rendering with fallback
├── enemy.js            (MODIFIED) - Add sprite rendering with fallback
├── bullet.js           (MODIFIED) - Add sprite rendering with fallback
└── main.js             (MODIFIED) - Initialize sprite loader, configure canvas
```

### Data Flow

1. **Initialization Phase** (before game loop):
   - `main.js` creates sprite loader instance
   - Sprite loader preloads all required assets using Vite imports
   - Canvas context configured with `imageSmoothingEnabled = false`
   - Game loop starts only after preload completes

2. **Rendering Phase** (every frame):
   - Entity renderers request sprites from loader cache
   - If sprite available: use `ctx.drawImage()` with cached HTMLImageElement
   - If sprite unavailable: fall back to existing `ctx.fillRect()` rendering
   - All coordinates floored to pixel boundaries for crisp rendering

### Component Interaction

```
┌─────────────┐
│   main.js   │
│             │
│ - Initialize│──────┐
│   loader    │      │
│ - Configure │      │
│   canvas    │      │
└─────────────┘      │
                     ▼
              ┌──────────────┐
              │  sprites.js  │
              │              │
              │ - Load PNGs  │
              │ - Cache imgs │
              │ - Vite paths │
              └──────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │player.js │ │enemy.js  │ │bullet.js │
  │          │ │          │ │          │
  │getSprite │ │getSprite │ │getSprite │
  │drawImage │ │drawImage │ │drawImage │
  │fallback  │ │fallback  │ │fallback  │
  └──────────┘ └──────────┘ └──────────┘
```

## Components and Interfaces

### Sprite Loader Module (`sprites.js`)

The sprite loader is responsible for loading, caching, and providing access to sprite images.

**Public API:**

```javascript
class SpriteLoader {
  /**
   * Preload all required sprites before game starts
   * @returns {Promise<void>} Resolves when all sprites loaded
   */
  async preloadAll()
  
  /**
   * Get a cached sprite by key
   * @param {string} key - Sprite identifier (e.g., 'zombie', 'player', 'ak47')
   * @returns {HTMLImageElement|null} Cached image or null if not loaded
   */
  getSprite(key)
  
  /**
   * Check if all sprites are loaded
   * @returns {boolean} True if preload complete
   */
  isReady()
}
```

**Internal Implementation:**

```javascript
// Sprite registry mapping keys to Vite asset paths
const SPRITE_PATHS = {
  zombie: '/sprites/zombie/Zombie.png',
  player: '/sprites/maincharacter.png',  // Exported from .aseprite
  ak47: '/sprites/GunsPack/Guns/AK47.png',
  luger: '/sprites/GunsPack/Guns/Luger.png',
  m15: '/sprites/GunsPack/Guns/M15.png',
  // ... other weapons
}

// Cache: Map<string, HTMLImageElement>
const spriteCache = new Map()

// Load single sprite using Vite's import system
async function loadSprite(key, path) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      spriteCache.set(key, img)
      resolve()
    }
    img.onerror = () => {
      console.warn(`Failed to load sprite: ${key} from ${path}`)
      resolve() // Don't reject, allow fallback rendering
    }
    img.src = path
  })
}
```

**Vite Integration:**

Sprites will be imported using Vite's static asset handling. In development, Vite serves files from the `sprites/` directory. In production, Vite copies assets to `dist/assets/` and rewrites paths.

```javascript
// Use explicit imports for Vite to track dependencies
import zombieSprite from '/sprites/zombie/Zombie.png'
import playerSprite from '/sprites/maincharacter.png'
// ... etc

const SPRITE_PATHS = {
  zombie: zombieSprite,
  player: playerSprite,
  // ...
}
```

### Player Renderer Modifications

**Current Implementation:**
- Uses `ctx.fillRect()` to draw body, head, eyes, arms, legs
- Rotates canvas to face mouse cursor
- Implements invincibility flash effect

**New Implementation:**

```javascript
export function drawPlayer(ctx, player, mouseX, mouseY, spriteLoader) {
  // Flash effect when invincible (skip drawing every other 0.1s)
  if (player.invincible && Math.floor(player.invTimer * 10) % 2 === 0) {
    return
  }
  
  const centerX = player.x + player.width / 2
  const centerY = player.y + player.height / 2
  
  // Calculate angle from player to mouse
  const dx = mouseX - centerX
  const dy = mouseY - centerY
  const angle = Math.atan2(dy, dx)
  
  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate(angle)
  
  const sprite = spriteLoader.getSprite('player')
  
  if (sprite) {
    // Draw sprite centered at origin
    // Sprite is 16x16, draw at -8, -8 to center
    ctx.drawImage(sprite, -8, -8, 16, 16)
  } else {
    // Fallback to existing fillRect rendering
    // ... (keep existing code)
  }
  
  ctx.restore()
}
```

**Weapon Rendering:**

Weapons will be rendered as a separate layer on top of the player sprite:

```javascript
function drawWeapon(ctx, player, mouseX, mouseY, spriteLoader) {
  const centerX = player.x + player.width / 2
  const centerY = player.y + player.height / 2
  
  const dx = mouseX - centerX
  const dy = mouseY - centerY
  const angle = Math.atan2(dy, dx)
  
  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate(angle)
  
  // Position weapon slightly in front of player
  const weaponOffsetX = 8
  const weaponOffsetY = 0
  
  const weaponSprite = spriteLoader.getSprite(player.currentWeapon || 'luger')
  
  if (weaponSprite) {
    // Scale weapon to appropriate size (weapons are ~32x16 pixels)
    ctx.drawImage(weaponSprite, weaponOffsetX, weaponOffsetY - 4, 16, 8)
  }
  
  ctx.restore()
}
```

### Enemy Renderer Modifications

**Current Implementation:**
- Uses `ctx.fillRect()` to draw body, head, arms, legs
- Implements shambling leg animation using `Math.sin(Date.now() / 200)`
- Supports color tint variation (3 different body colors)

**New Implementation:**

```javascript
export function drawEnemies(ctx, enemies, spriteLoader) {
  // Calculate shamble offset for leg animation (shared across all zombies)
  const shambleOffset = Math.sin(Date.now() / 200) * 2
  
  const zombieSprite = spriteLoader.getSprite('zombie')
  
  for (const enemy of enemies) {
    if (!enemy.alive) continue
    
    const x = Math.floor(enemy.x)
    const y = Math.floor(enemy.y)
    
    if (zombieSprite) {
      ctx.save()
      
      // Apply shamble animation by translating vertically
      ctx.translate(0, shambleOffset)
      
      // Draw zombie sprite (14x14 to match hitbox)
      ctx.drawImage(zombieSprite, x, y, 14, 14)
      
      // Apply color tint using globalCompositeOperation
      if (enemy.colorTint > 0) {
        ctx.globalCompositeOperation = 'multiply'
        const tintColors = ['#2d5016', '#4a5d23', '#3d4a3a']
        ctx.fillStyle = tintColors[enemy.colorTint % 3]
        ctx.fillRect(x, y, 14, 14)
        ctx.globalCompositeOperation = 'source-over'
      }
      
      ctx.restore()
    } else {
      // Fallback to existing fillRect rendering
      // ... (keep existing code)
    }
  }
}
```

**Note on Color Tinting:**
The zombie sprite will be rendered with color tinting applied using canvas composite operations to maintain visual variety while using a single sprite asset.

### Canvas Configuration

The canvas context must be configured to preserve pixel art rendering:

```javascript
// In main.js initialization
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// Disable image smoothing for crisp pixel art
ctx.imageSmoothingEnabled = false
ctx.mozImageSmoothingEnabled = false
ctx.webkitImageSmoothingEnabled = false
ctx.msImageSmoothingEnabled = false
```

## Data Models

### Sprite Cache Structure

```javascript
// Map<string, HTMLImageElement>
{
  'zombie': HTMLImageElement,
  'player': HTMLImageElement,
  'ak47': HTMLImageElement,
  'luger': HTMLImageElement,
  'm15': HTMLImageElement,
  'm24': HTMLImageElement,
  'm92': HTMLImageElement,
  'mp5': HTMLImageElement,
  'revolver': HTMLImageElement,
  'sawedoffshotgun': HTMLImageElement
}
```

### Sprite Metadata

```javascript
// Optional: Store sprite dimensions for scaling calculations
const SPRITE_METADATA = {
  zombie: { width: 14, height: 14, sourceWidth: 14, sourceHeight: 14 },
  player: { width: 16, height: 16, sourceWidth: 16, sourceHeight: 16 },
  ak47: { width: 32, height: 16, displayWidth: 16, displayHeight: 8 },
  // ...
}
```

### Player State Extension

```javascript
// Add weapon type to player state (in state.js)
player: {
  x: 320,
  y: 240,
  width: 16,
  height: 16,
  speed: 200,
  hp: 3,
  invincible: false,
  invTimer: 0,
  lastShotTime: 0,
  shootCooldown: 250,
  currentWeapon: 'luger'  // NEW: Track current weapon for sprite selection
}
```

### Loading State

```javascript
// Track loading progress for UI feedback
const loadingState = {
  total: 0,
  loaded: 0,
  failed: 0,
  isComplete: false
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Sprite Cache Consistency

*For any* sprite that has been successfully loaded into the cache, requesting that sprite again should return the same HTMLImageElement instance without triggering a new load operation.

**Validates: Requirements 1.2, 1.3**

### Property 2: Enemy Sprite Dimensions

*For any* enemy entity being rendered with a sprite, the sprite should be drawn with dimensions matching the enemy's hitbox (14x14 pixels).

**Validates: Requirements 2.3**

### Property 3: Color Tint Application

*For any* enemy entity with a non-zero colorTint value, the rendering should apply the corresponding color tint to the sprite.

**Validates: Requirements 2.4**

### Property 4: Shamble Animation Preservation

*For any* frame where enemies are rendered, the shamble offset calculation should be applied to the vertical position of zombie sprites.

**Validates: Requirements 2.6**

### Property 5: Player Rotation Alignment

*For any* mouse cursor position, the player sprite should be rotated to face toward that position using the angle calculated from the player center to the mouse coordinates.

**Validates: Requirements 3.2**

### Property 6: Player Sprite Dimensions

*For any* player rendering with a sprite, the sprite should be drawn with dimensions matching the player's hitbox (16x16 pixels).

**Validates: Requirements 3.3**

### Property 7: Invincibility Flash Preservation

*For any* frame where the player is invincible and the flash condition is met (Math.floor(invTimer * 10) % 2 === 0), the player sprite should not be rendered.

**Validates: Requirements 3.4**

### Property 8: Weapon Position Offset

*For any* player position and weapon rendering, the weapon sprite should be positioned relative to the player's center point with a consistent offset.

**Validates: Requirements 4.2**

### Property 9: Weapon Rotation Alignment

*For any* mouse cursor position, the weapon sprite should be rotated to the same angle as the player sprite (facing the mouse).

**Validates: Requirements 4.3**

### Property 10: Weapon Sprite Selection

*For any* weapon type stored in player state, the renderer should request the corresponding weapon sprite from the sprite loader.

**Validates: Requirements 4.5**

### Property 11: Weapon Aspect Ratio Preservation

*For any* weapon sprite being scaled for rendering, the aspect ratio of the original sprite should be maintained.

**Validates: Requirements 4.6**

### Property 12: Cached Image Reference Usage

*For any* sprite rendering operation, if a sprite is available in the cache, the renderer should use the cached HTMLImageElement reference rather than loading a new image.

**Validates: Requirements 6.3**

### Property 13: Graceful Null Sprite Handling

*For any* rendering function call where getSprite returns null, the function should complete without throwing an exception and fall back to procedural rendering.

**Validates: Requirements 7.4**

### Property 14: Integer Scaling Preference

*For any* sprite that requires scaling, if the target dimensions are integer multiples of the source dimensions, integer scaling factors should be used.

**Validates: Requirements 8.2**

### Property 15: Pixel-Perfect Coordinate Flooring

*For any* sprite rendering operation, the x and y coordinates passed to ctx.drawImage should be integer values (floored from floating-point positions).

**Validates: Requirements 8.5**

### Property 16: Environment-Independent Path Resolution

*For any* sprite import path, the resolved path should correctly reference the sprite asset in both development and production build environments.

**Validates: Requirements 10.4**

## Error Handling

### Sprite Loading Failures

**Strategy:** Graceful degradation with fallback rendering

- **Detection:** Image `onerror` event during load
- **Response:** Log warning, set cache entry to null, continue execution
- **Recovery:** Renderer checks for null and uses fillRect fallback
- **User Impact:** Game remains playable with procedural graphics

```javascript
img.onerror = () => {
  console.warn(`Failed to load sprite: ${key} from ${path}`)
  spriteCache.set(key, null)  // Mark as failed
  resolve()  // Don't reject promise
}
```

### Missing Sprite Files

**Strategy:** Development-time warnings with runtime fallback

- **Detection:** 404 errors during preload
- **Response:** Log detailed warning with expected path
- **Recovery:** Null cache entries trigger fallback rendering
- **User Impact:** Visual degradation but full functionality

### Aseprite File Handling

**Strategy:** Automatic PNG resolution with helpful errors

- **Detection:** Reference to .aseprite extension
- **Response:** Attempt to load .png with same base name
- **Recovery:** If PNG missing, log export instructions
- **User Impact:** Clear guidance for asset preparation

```javascript
// If path ends with .aseprite, try .png
if (path.endsWith('.aseprite')) {
  const pngPath = path.replace('.aseprite', '.png')
  console.info(`Attempting to load PNG export: ${pngPath}`)
  // ... load pngPath
}
```

### Canvas Context Errors

**Strategy:** Defensive checks with clear error messages

- **Detection:** Null context or missing drawImage method
- **Response:** Log error and skip sprite rendering
- **Recovery:** Fall back to fillRect rendering
- **User Impact:** Game continues with procedural graphics

### Vite Build Path Resolution

**Strategy:** Static imports with build-time validation

- **Detection:** Build errors if sprite files missing
- **Response:** Vite will fail build with clear error
- **Recovery:** Developer must add missing sprites
- **User Impact:** Prevents broken production builds

## Testing Strategy

### Unit Testing Approach

The sprite integration will be tested using a combination of unit tests and property-based tests:

**Unit Tests** will cover:
- Specific sprite loading examples (zombie.png, player.png)
- Error handling for invalid paths
- Canvas configuration (imageSmoothingEnabled = false)
- Fallback rendering when sprites unavailable
- Preload completion and loading state tracking
- Vite import path resolution

**Property-Based Tests** will cover:
- Cache consistency across all sprite keys
- Dimension preservation for all entities
- Rotation calculations for all mouse positions
- Coordinate flooring for all positions
- Null sprite handling for all renderers

### Property-Based Testing Configuration

**Library:** fast-check (JavaScript property-based testing library)

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with feature name and property reference
- Tag format: `Feature: sprite-integration, Property {number}: {property_text}`

**Example Test Structure:**

```javascript
import fc from 'fast-check'
import { describe, it, expect } from 'vitest'

describe('Sprite Integration Properties', () => {
  it('Property 1: Sprite Cache Consistency', () => {
    // Feature: sprite-integration, Property 1: Sprite Cache Consistency
    fc.assert(
      fc.property(
        fc.constantFrom('zombie', 'player', 'ak47', 'luger'),
        async (spriteKey) => {
          const loader = new SpriteLoader()
          await loader.preloadAll()
          
          const firstGet = loader.getSprite(spriteKey)
          const secondGet = loader.getSprite(spriteKey)
          
          expect(firstGet).toBe(secondGet)  // Same instance
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('Property 15: Pixel-Perfect Coordinate Flooring', () => {
    // Feature: sprite-integration, Property 15: Pixel-Perfect Coordinate Flooring
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 640 }),
        fc.float({ min: 0, max: 480 }),
        (x, y) => {
          const mockCtx = createMockContext()
          const enemy = { x, y, width: 14, height: 14, alive: true, colorTint: 0 }
          
          drawEnemies(mockCtx, [enemy], mockSpriteLoader)
          
          const drawCall = mockCtx.drawImageCalls[0]
          expect(drawCall.x).toBe(Math.floor(x))
          expect(drawCall.y).toBe(Math.floor(y))
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Integration Testing

**Preload Integration:**
- Test that main.js waits for preloadAll() before starting game loop
- Verify loading screen displays during preload
- Confirm game starts only when isReady() returns true

**Rendering Integration:**
- Test complete render cycle with sprites loaded
- Test complete render cycle with sprites failed
- Verify fallback rendering produces valid output
- Confirm no visual glitches during sprite/fallback transitions

**Build Integration:**
- Test production build includes all sprite assets
- Verify sprite paths resolve correctly in dist/
- Confirm GitHub Pages deployment serves sprites with correct MIME types

### Performance Testing

**Benchmarks:**
- Measure frame time with sprite rendering vs fillRect rendering
- Target: <16.67ms per frame (60 FPS)
- Test with maximum enemy count (wave 10+)

**Memory Testing:**
- Verify sprite cache doesn't grow unbounded
- Confirm no memory leaks from image loading
- Test cache size remains constant after preload

### Manual Testing Checklist

- [ ] Zombie sprites render correctly with color tints
- [ ] Player sprite rotates to face mouse
- [ ] Weapon sprites render on top of player
- [ ] Invincibility flash effect works with sprites
- [ ] Shamble animation visible on zombies
- [ ] Fallback rendering works when sprites disabled
- [ ] No image smoothing (crisp pixel art)
- [ ] Loading screen shows during preload
- [ ] Game works in production build
- [ ] Sprites load correctly on GitHub Pages
