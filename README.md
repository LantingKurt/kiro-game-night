# Pixel Survivor

A retro-style survival shooter game built with vanilla JavaScript and Vite.

## Features

- 8-directional WASD movement
- Mouse aim and shoot mechanics
- Wave-based enemy spawning with increasing difficulty
- Score tracking and leaderboard (powered by Supabase)
- Pixel art graphics rendered with canvas
- Invincibility frames after taking damage

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the dev server:
```bash
npm run dev
```

## Supabase Setup

Create a `leaderboard` table with the following schema:

```sql
CREATE TABLE leaderboard (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name text NOT NULL,
  score int4 NOT NULL,
  wave_reached int4 NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anonymous SELECT
CREATE POLICY "Allow anonymous select" ON leaderboard
  FOR SELECT TO anon USING (true);

-- Allow anonymous INSERT
CREATE POLICY "Allow anonymous insert" ON leaderboard
  FOR INSERT TO anon WITH CHECK (true);
```

## GitHub Pages Deployment

1. Update `vite.config.js` with your repository name:
```js
base: '/your-repo-name/'
```

2. Add secrets to your GitHub repository:
   - Go to Settings > Secrets and variables > Actions
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`

3. Enable GitHub Pages:
   - Go to Settings > Pages
   - Source: GitHub Actions

4. Push to main branch to trigger deployment

## Controls

- **WASD**: Move player
- **Mouse**: Aim
- **Click**: Shoot
- **Space** (on menu): View leaderboard
- **ESC** (on leaderboard): Return to menu

## Game Mechanics

- Start with 3 lives (hearts)
- Enemies spawn in waves from canvas edges
- Each wave increases enemy count and speed
- Score +10 per enemy killed
- 1.5 second invincibility after taking damage
- 3 second break between waves
