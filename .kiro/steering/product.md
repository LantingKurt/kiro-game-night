# Product Overview

Pixel Survivor is a retro-style survival shooter game built with vanilla JavaScript. Players control a character that moves with WASD and shoots toward the mouse cursor, fighting waves of enemies that spawn from canvas edges.

## Core Mechanics

- 8-directional movement with mouse-aim shooting
- Wave-based enemy spawning with progressive difficulty
- 3 lives with invincibility frames after damage
- Score tracking (+10 per enemy killed)
- Leaderboard system powered by Supabase

## Game Flow

1. Menu screen → Start game or view leaderboard
2. Playing → Survive waves, enemies increase in count and speed
3. Wave breaks → 3-second pause between waves
4. Game Over → Submit score with name to leaderboard

## Technical Constraints

- Canvas size: 640x480 pixels
- Pixel art aesthetic (no image files, all ctx.fillRect rendering)
- Frame-rate independent movement using delta time
- Anonymous Supabase access for leaderboard (RLS enabled)
