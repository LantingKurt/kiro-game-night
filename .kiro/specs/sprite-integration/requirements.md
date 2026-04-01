# Requirements Document

## Introduction

This document specifies the requirements for integrating actual sprite image assets into the Pixel Survivor game. Currently, all game entities (player, enemies, weapons) are rendered using `ctx.fillRect()` calls. This feature will replace the procedural rendering with actual sprite images while maintaining the retro pixel art aesthetic and game performance.

## Glossary

- **Sprite_Loader**: The module responsible for loading and caching sprite image assets
- **Player_Renderer**: The rendering component for the main character sprite
- **Enemy_Renderer**: The rendering component for zombie enemy sprites
- **Weapon_Renderer**: The rendering component for gun weapon sprites
- **Canvas_Context**: The 2D rendering context for the HTML5 canvas element
- **Asset_Path**: The file system path to sprite image files in the sprites/ directory
- **Image_Cache**: In-memory storage of loaded HTMLImageElement objects
- **Pixel_Art_Mode**: Canvas rendering mode that prevents image smoothing (imageSmoothingEnabled = false)

## Requirements

### Requirement 1: Sprite Asset Loading

**User Story:** As a developer, I want to load sprite images from the file system, so that they can be rendered on the canvas instead of procedural shapes.

#### Acceptance Criteria

1. THE Sprite_Loader SHALL load PNG image files from the sprites/ directory
2. WHEN a sprite image is requested, THE Sprite_Loader SHALL return a cached HTMLImageElement if already loaded
3. WHEN a sprite image is requested for the first time, THE Sprite_Loader SHALL load the image asynchronously and cache it
4. IF a sprite image fails to load, THEN THE Sprite_Loader SHALL log an error and return null
5. THE Sprite_Loader SHALL preload all required sprites before the game starts
6. THE Sprite_Loader SHALL maintain Pixel_Art_Mode for all rendered sprites

### Requirement 2: Zombie Sprite Integration

**User Story:** As a player, I want to see zombie sprites instead of colored rectangles, so that enemies are more visually appealing.

#### Acceptance Criteria

1. THE Enemy_Renderer SHALL render zombie sprites from sprites/zombie/Zombie.png
2. WHEN drawing an enemy, THE Enemy_Renderer SHALL use ctx.drawImage() instead of ctx.fillRect()
3. THE Enemy_Renderer SHALL scale the zombie sprite to match the current enemy hitbox dimensions (14x14 pixels)
4. THE Enemy_Renderer SHALL maintain the existing color tint variation system for visual diversity
5. WHEN a zombie sprite is not loaded, THE Enemy_Renderer SHALL fall back to the current fillRect rendering
6. THE Enemy_Renderer SHALL preserve the shambling leg animation effect

### Requirement 3: Player Character Sprite Integration

**User Story:** As a player, I want to see my character rendered with the actual sprite, so that the game has a more polished appearance.

#### Acceptance Criteria

1. THE Player_Renderer SHALL render the player sprite from sprites/maincharacter.aseprite exported as PNG
2. WHEN drawing the player, THE Player_Renderer SHALL rotate the sprite to face the mouse cursor
3. THE Player_Renderer SHALL scale the sprite to match the current player hitbox dimensions (16x16 pixels)
4. THE Player_Renderer SHALL maintain the invincibility flash effect when the player is invincible
5. WHEN the player sprite is not loaded, THE Player_Renderer SHALL fall back to the current fillRect rendering

### Requirement 4: Weapon Sprite Integration

**User Story:** As a player, I want to see weapon sprites rendered on my character, so that I can visually identify which gun I'm using.

#### Acceptance Criteria

1. THE Weapon_Renderer SHALL render gun sprites from sprites/GunsPack/Guns/ directory
2. THE Weapon_Renderer SHALL position the weapon sprite relative to the player's center point
3. THE Weapon_Renderer SHALL rotate the weapon sprite to align with the mouse cursor direction
4. THE Weapon_Renderer SHALL render the weapon sprite on top of the player sprite
5. WHERE different weapon types exist, THE Weapon_Renderer SHALL display the corresponding gun sprite
6. THE Weapon_Renderer SHALL scale weapon sprites proportionally to maintain pixel art aesthetic

### Requirement 5: Aseprite File Handling

**User Story:** As a developer, I want to handle .aseprite files properly, so that sprite assets can be used in the game.

#### Acceptance Criteria

1. THE Sprite_Loader SHALL support loading PNG exports of .aseprite files
2. WHEN an .aseprite file is referenced, THE Sprite_Loader SHALL look for a corresponding .png file in the same directory
3. IF only .aseprite files exist, THEN THE Sprite_Loader SHALL log a warning indicating PNG export is required
4. THE Sprite_Loader SHALL document the export process for .aseprite files in code comments

### Requirement 6: Performance and Caching

**User Story:** As a player, I want the game to maintain smooth performance, so that sprite rendering doesn't cause frame rate drops.

#### Acceptance Criteria

1. THE Sprite_Loader SHALL load all sprites during game initialization before gameplay starts
2. THE Sprite_Loader SHALL cache loaded images to prevent redundant file system access
3. WHEN rendering sprites, THE Canvas_Context SHALL use cached HTMLImageElement references
4. THE Sprite_Loader SHALL provide a loading progress indicator during asset preloading
5. THE Game_Loop SHALL maintain 60 FPS performance with sprite rendering enabled

### Requirement 7: Fallback Rendering

**User Story:** As a developer, I want graceful fallback to procedural rendering, so that the game remains playable if sprites fail to load.

#### Acceptance Criteria

1. WHEN a sprite fails to load, THE renderer SHALL use the existing fillRect rendering as fallback
2. THE renderer SHALL log a warning when falling back to procedural rendering
3. THE Game_Loop SHALL continue normal operation regardless of sprite loading failures
4. THE renderer SHALL not throw exceptions when sprite images are unavailable

### Requirement 8: Sprite Scaling and Pixel Art Preservation

**User Story:** As a player, I want sprites to maintain crisp pixel art appearance, so that the retro aesthetic is preserved.

#### Acceptance Criteria

1. THE Canvas_Context SHALL disable image smoothing (imageSmoothingEnabled = false)
2. WHEN scaling sprites, THE renderer SHALL use integer scaling factors when possible
3. THE renderer SHALL maintain the 640x480 canvas resolution
4. THE renderer SHALL preserve the existing 32x32 pixel grid background
5. THE renderer SHALL render sprites at pixel-perfect positions using Math.floor() for coordinates

### Requirement 9: Sprite Animation Support

**User Story:** As a player, I want to see animated sprites, so that the game feels more dynamic and alive.

#### Acceptance Criteria

1. WHERE sprite sheets exist, THE Sprite_Loader SHALL support loading multi-frame sprite sheets
2. THE Enemy_Renderer SHALL cycle through zombie animation frames based on game time
3. THE Player_Renderer SHALL support idle and walking animation states
4. THE renderer SHALL maintain consistent animation frame rates independent of game FPS
5. WHEN using static sprites, THE renderer SHALL apply the existing procedural animation effects

### Requirement 10: Build System Integration

**User Story:** As a developer, I want sprite assets bundled correctly, so that the game works in production builds.

#### Acceptance Criteria

1. THE Vite_Build_System SHALL include sprite assets in the production bundle
2. THE Sprite_Loader SHALL use Vite's asset import system for sprite paths
3. WHEN building for production, THE Vite_Build_System SHALL optimize sprite file sizes
4. THE Sprite_Loader SHALL resolve Asset_Path correctly in both development and production environments
5. THE GitHub_Pages_Deployment SHALL serve sprite assets with correct MIME types
