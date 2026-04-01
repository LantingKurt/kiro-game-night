Improve the game significantly with these changes:

1. PLAYER SPRITE — Draw the player as a top-down pixel person:
   - Body: a colored square (torso)
   - Head: a smaller square centered above the body
   - Arms: two thin 2px wide rectangles on the sides
   - Legs: two thin rectangles at the bottom
   - Rotate the entire player sprite to face the mouse cursor each frame
   - Use ctx.save(), ctx.translate(player.x, player.y), ctx.rotate(angle), draw centered at 0,0, ctx.restore()

2. ZOMBIE ENEMIES — Redraw enemies as pixel zombies:
   - Body: dark green square (torso)
   - Head: slightly larger greenish square on top
   - Arms: outstretched to the sides (wider than body, like reaching arms)
   - Randomly tint each zombie slightly differently (dark green, olive, grey-green) for variety
   - Shamble effect: offset the legs slightly each frame using Math.sin(Date.now() / 200) for a walking wobble

3. POWER-UP SYSTEM — At the end of every wave, pause the game and show a power-up selection screen:
   - Show 3 randomly chosen power-up cards for the player to pick one
   - Each card shows the power-up name and a short description
   - Power-ups available:
     a. Speed Boost — increases player.speed by 40 (stackable, max 320)
     b. Rapid Fire — reduces shoot cooldown by 30% (stackable, min 80ms)
     c. Triple Shot — bullets fire in 3 directions (center + 15 degrees left/right)
     d. Big Bullets — bullet size increases to 8x8, damage radius larger
     e. Piercing Shot — bullets pass through enemies instead of stopping
     f. Shield — grants 1 extra life (max 6)
   - Store active power-ups in state.powerUps array
   - Apply power-up effects in the relevant update functions

4. OBSTACLES — Each wave spawns obstacles on the canvas:
   - Wave 1-2: 3 obstacles (stone walls, drawn as dark grey pixel rectangles, 40x40)
   - Wave 3-5: 5 obstacles
   - Wave 6+: 7 obstacles
   - Obstacles are placed randomly but never on top of the player spawn point (center) or within 80px of it
   - Enemies and bullets collide with obstacles (bullets despawn, enemies path around using simple steering)
   - Player cannot walk through obstacles
   - Draw obstacles as stacked pixel brick rectangles using alternating dark grey shades

All other existing logic (WASD, Supabase leaderboard, wave system, lives, score) stays the same.