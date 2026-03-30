# Requirements Document

## Introduction

This document specifies the functional requirements for Game Upgrades v1, a feature enhancement to Pixel Survivor that adds player sprite rotation, zombie-themed enemies, a power-up selection system, and obstacle generation. These improvements enhance visual polish, strategic depth, and gameplay variety while maintaining the existing wave-based survival mechanics.

## Glossary

- **Player**: The player-controlled character sprite that moves with WASD and shoots toward the mouse cursor
- **Zombie**: Enemy sprite with shambling animation and color variation
- **Power_Up_System**: The between-wave interface that presents upgrade choices to the player
- **Obstacle**: A static 40x40 pixel barrier that blocks movement and projectiles
- **Canvas**: The 640x480 pixel rendering surface for the game
- **Wave**: A gameplay phase where enemies spawn and attack the player
- **Collision_Detector**: The system component responsible for detecting overlaps between game entities
- **Sprite**: A visual representation of a game entity rendered using pixel art
- **AABB**: Axis-Aligned Bounding Box collision detection method
- **Safe_Zone**: The 80-pixel radius around player spawn point (320, 240) where obstacles cannot be placed

## Requirements

### Requirement 1: Player Sprite Rotation

**User Story:** As a player, I want my character to face the direction I'm aiming, so that the game feels more responsive and visually intuitive.

#### Acceptance Criteria

1. WHEN the mouse cursor moves, THE Player SHALL rotate to face the cursor position
2. THE Player SHALL calculate rotation angle using Math.atan2() for correct quadrant handling
3. WHEN rendering the player, THE Canvas SHALL apply rotation transformation around the player center point
4. WHEN the player has invincibility active, THE Player SHALL maintain rotation while applying flash effect
5. WHEN rotation is applied, THE Canvas SHALL restore transformation state after rendering

### Requirement 2: Zombie Enemy Sprites

**User Story:** As a player, I want enemies to look like zombies with shambling movement, so that the game has a clear theme and visual character.

#### Acceptance Criteria

1. WHEN an enemy spawns, THE Zombie SHALL be assigned a random color tint value between 0 and 2
2. WHEN rendering enemies, THE Zombie SHALL display color variation using dark green, olive, or grey-green based on color tint
3. WHEN rendering enemies, THE Zombie SHALL apply shambling leg animation using a sine wave calculation
4. THE Zombie SHALL synchronize shamble animation across all zombies using Date.now()
5. WHEN rendering zombie sprites, THE Sprite SHALL include body, oversized head, and outstretched arms

### Requirement 3: Power-Up Selection System

**User Story:** As a player, I want to choose upgrades between waves, so that I can customize my strategy and feel progression.

#### Acceptance Criteria

1. WHEN a wave is cleared, THE Power_Up_System SHALL transition the screen to 'powerup-selection'
2. WHEN the power-up screen displays, THE Power_Up_System SHALL present exactly 3 unique random power-up options
3. WHEN a player selects a power-up, THE Power_Up_System SHALL apply the power-up effect to the game state
4. WHEN a power-up is selected, THE Power_Up_System SHALL transition the screen to 'wave-break'
5. THE Power_Up_System SHALL support the following power-ups: Speed Boost, Rapid Fire, Triple Shot, Big Bullets, Piercing Shot, and Shield
6. WHEN Speed Boost is applied, THE Power_Up_System SHALL increase player speed by 40 up to a maximum of 320
7. WHEN Rapid Fire is applied, THE Power_Up_System SHALL reduce shoot cooldown by 30% down to a minimum of 80ms
8. WHEN Shield is applied, THE Power_Up_System SHALL increase player HP by 1 up to a maximum of 6
9. WHEN Triple Shot is applied, THE Power_Up_System SHALL enable firing 3 bullets at 15-degree intervals
10. WHEN Big Bullets is applied, THE Power_Up_System SHALL increase bullet size to 8x8 pixels with damage radius of 2
11. WHEN Piercing Shot is applied, THE Power_Up_System SHALL enable bullets to pass through enemies

### Requirement 4: Obstacle Generation

**User Story:** As a player, I want obstacles on the battlefield, so that I have tactical positioning options and increased challenge.

#### Acceptance Criteria

1. WHEN a wave starts, THE Obstacle SHALL generate obstacles based on wave number
2. WHEN wave number is 1 or 2, THE Obstacle SHALL generate exactly 3 obstacles
3. WHEN wave number is 3, 4, or 5, THE Obstacle SHALL generate exactly 5 obstacles
4. WHEN wave number is 6 or higher, THE Obstacle SHALL generate exactly 7 obstacles
5. WHEN placing obstacles, THE Obstacle SHALL ensure no obstacle center is within 80 pixels of player spawn point (320, 240)
6. THE Obstacle SHALL be rendered as 40x40 pixel stacked brick rectangles
7. WHEN placing obstacles, THE Obstacle SHALL ensure all obstacles are within canvas bounds

### Requirement 5: Obstacle Collision Detection

**User Story:** As a player, I want obstacles to block bullets and movement, so that positioning and tactics matter in gameplay.

#### Acceptance Criteria

1. WHEN a bullet overlaps with an obstacle, THE Collision_Detector SHALL mark the bullet as dead
2. WHEN the player overlaps with an obstacle, THE Collision_Detector SHALL prevent player movement through the obstacle
3. WHEN resolving player-obstacle collision, THE Collision_Detector SHALL push the player back along the axis with smallest overlap
4. WHEN a bullet has piercing power-up active, THE Collision_Detector SHALL still mark the bullet as dead when hitting obstacles
5. THE Collision_Detector SHALL use AABB overlap detection for all obstacle collisions

### Requirement 6: Enemy Obstacle Avoidance

**User Story:** As a player, I want enemies to navigate around obstacles, so that they don't get stuck and gameplay remains challenging.

#### Acceptance Criteria

1. WHEN an enemy is within 60 pixels of an obstacle, THE Zombie SHALL apply repulsion steering away from the obstacle
2. WHEN calculating enemy movement, THE Zombie SHALL combine player pursuit direction with obstacle avoidance vectors
3. WHEN multiple obstacles are nearby, THE Zombie SHALL accumulate repulsion forces from all nearby obstacles
4. THE Zombie SHALL normalize the final movement vector before applying speed and delta time

### Requirement 7: Power-Up Visual Interface

**User Story:** As a player, I want to see clear power-up choices with descriptions, so that I can make informed strategic decisions.

#### Acceptance Criteria

1. WHEN the power-up selection screen displays, THE Power_Up_System SHALL render 3 cards with power-up name and description
2. WHEN the player clicks on a power-up card, THE Power_Up_System SHALL detect which card was clicked based on mouse coordinates
3. WHEN an invalid click occurs outside card boundaries, THE Power_Up_System SHALL ignore the click and wait for valid selection
4. THE Power_Up_System SHALL display cards at consistent positions (y=200, spaced 200px apart horizontally)

### Requirement 8: Game State Integration

**User Story:** As a developer, I want the new features to integrate seamlessly with existing game systems, so that the game remains stable and maintainable.

#### Acceptance Criteria

1. WHEN power-ups are applied, THE Power_Up_System SHALL modify the existing game state properties without breaking existing systems
2. WHEN obstacles are generated, THE Obstacle SHALL store obstacle data in the game state obstacles array
3. WHEN the game loop runs, THE Canvas SHALL render player rotation, zombie sprites, obstacles, and power-up screens in the correct order
4. THE Power_Up_System SHALL preserve existing wave progression, scoring, and leaderboard functionality
5. THE Obstacle SHALL integrate with existing collision detection without modifying bullet-enemy or player-enemy collision logic
