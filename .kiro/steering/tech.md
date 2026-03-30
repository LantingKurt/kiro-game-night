# Tech Stack

## Build System

- **Vite** (v8.0.1) - Development server and build tool
- **ES Modules** - Native JavaScript modules (type: "module" in package.json)
- **Vanilla JavaScript** - No framework, pure JS with Canvas API

## Dependencies

- `@supabase/supabase-js` (v2.100.1) - Backend for leaderboard storage

## Environment Variables

Required in `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

- **Target**: GitHub Pages
- **Configuration**: Set `base` in `vite.config.js` to repository name
- **Secrets**: Add Supabase credentials to GitHub Actions secrets
- **Trigger**: Push to main branch

## Canvas Rendering

- Image rendering: `pixelated` / `crisp-edges` for sharp pixel art
- All sprites drawn with `ctx.fillRect()` - no image assets
- Background: 32x32 pixel grid overlay on dark navy (#0d1117)
