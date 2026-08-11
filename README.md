# CulinaryAgent

A small React + Node app for asking a cooking AI for recipes.

It runs with Vite on the frontend and Express on the backend. The backend can use Gemini if you set `GEMINI_API_KEY`, and it also has a curated fallback recipe mode so the app still works without the AI key.

## What it does

- Lets you ask for recipes by ingredient, diet, or meal type
- Shows recipe cards with ingredients, steps, timers, and substitutions
- Sends requests to `/api/recipe` and `/api/substitute`
- Uses fallback recipes when AI is unavailable
- Uses IP-based rate limiting on the backend

## Setup

1. Install dependencies

```bash
npm install
```

2. Set the AI key if you want Gemini to generate recipes

Create a `.env` file with:

```env
GEMINI_API_KEY=your_api_key_here
```

If you skip this, the server will return curated fallback recipes instead.

3. Start the app

```bash
npm run dev
```

Then open the local Vite url shown in the terminal.

## Build and run

```bash
npm run build
npm run start
```

## Notes

- The app is at `src/`
- Backend code is in `server.ts`
- Fallback recipes are in `src/data/fallbackRecipes.ts`
- API calls are in `src/services/api.ts`
- UI lives in `src/components/AgentChatWindow.tsx`

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - build frontend and bundle backend
- `npm run start` - run the built server
- `npm run preview` - preview the Vite build
- `npm run clean` - delete build output
- `npm run lint` - run TypeScript type checks
