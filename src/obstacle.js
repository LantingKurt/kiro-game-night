/**
 * Obstacle System
 * Generates and renders obstacles that block movement and projectiles
 */

/**
 * Generate obstacles based on wave number
 * @param {Object} state - Game state
 * 
 * Wave-based obstacle count:
 * - Wave 1-2: 3 obstacles
 * - Wave 3-5: 5 obstacles
 * - Wave 6+: 7 obstacles
 * 
 * Placement rules:
 * - Random placement within canvas bounds (0 <= x <= 600, 0 <= y <= 440)
 * - Safe zone: No obstacles within 80px of player spawn point (320, 240)
 * - Placement attempt limit: 100 tries per obstacle
 */
export function generateObstacles(state) {
  const wave = state.wave;
  let obstacleCount;
  
  // Determine obstacle count based on wave number
  if (wave <= 2) {
    obstacleCount = 3;
  } else if (wave <= 5) {
    obstacleCount = 5;
  } else {
    obstacleCount = 7;
  }
  
  state.obstacles = [];
  const playerSpawnX = 320;
  const playerSpawnY = 240;
  const safeRadius = 80;
  
  for (let i = 0; i < obstacleCount; i++) {
    let x, y;
    let attempts = 0;
    
    do {
      // Random placement within canvas bounds
      // Canvas is 640x480, obstacles are 40x40
      // So x can be 0 to 600, y can be 0 to 440
      x = Math.random() * (640 - 40);
      y = Math.random() * (480 - 40);
      
      // Calculate distance from obstacle center to player spawn point
      const dx = (x + 20) - playerSpawnX;
      const dy = (y + 20) - playerSpawnY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      attempts++;
      if (attempts > 100) break; // Prevent infinite loop
      
    } while (dist < safeRadius);
    
    state.obstacles.push({ x, y, width: 40, height: 40 });
  }
}

/**
 * Render obstacles as stacked brick rectangles
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} obstacles - Array of obstacle objects
 */
export function drawObstacles(ctx, obstacles) {
  for (const obstacle of obstacles) {
    const x = Math.floor(obstacle.x);
    const y = Math.floor(obstacle.y);
    
    // Draw stacked brick pattern with alternating grey shades
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(x, y, 40, 40);
    
    // Brick pattern - alternating rows
    ctx.fillStyle = '#2d3748';
    
    // Top row bricks
    ctx.fillRect(x, y, 18, 8);
    ctx.fillRect(x + 22, y, 18, 8);
    
    // Second row bricks (offset)
    ctx.fillRect(x + 10, y + 10, 18, 8);
    
    // Third row bricks
    ctx.fillRect(x, y + 20, 18, 8);
    ctx.fillRect(x + 22, y + 20, 18, 8);
    
    // Fourth row bricks (offset)
    ctx.fillRect(x + 10, y + 30, 18, 8);
  }
}
