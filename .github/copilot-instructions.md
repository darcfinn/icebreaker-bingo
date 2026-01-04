# Copilot / AI Agent Instructions for Icebreaker Bingo

Quick, actionable guidance so an AI coding agent can be immediately productive in this codebase.

- Project: Vite + React (no TypeScript). Styling via Tailwind. Backend via Firebase (Auth + Firestore).

## Big picture
- Single-page React app served by Vite. Entry: `src/main.jsx` → `src/App.jsx`.
- Firebase is initialized in `src/lib/firebase.js`. Firestore holds `games` documents keyed by a short game code.
- Admins authenticate with Email/Password; players sign-in anonymously and are saved under `games.<gameId>.players`.
- Key flows:
  - Admins: login → `gameService.createGame()` → game document with `id`, `status`, `adminId`, `players`.
  - Players: join with game code + name → `gameService.addPlayerToGame()` and progress updates via `gameService.updatePlayerProgress()`.
  - Real-time updates use Firestore listeners (`onSnapshot`) in `useGame` and parts of `App.jsx`.

## Data model (discoverable examples)
- Game document (`/games/<GAMECODE>`):
  - id: string (game code)
  - name: string
  - status: 'active' | 'ended'
  - adminId, adminEmail
  - players: object where keys are playerId → { id, name, board, names }
  - createdAt / endedAt (serverTimestamp)
- Player progress stored as `players.<playerId>.names` (object `{ index: name }`). `updateDoc` and dot-path field updates are used.

## Important files & patterns to reference
- `src/lib/firebase.js` — Firebase config + exported `auth` and `db`. Uses Vite env vars `VITE_FIREBASE_*` with fallback defaults.
- `src/services/gameService.js` — CRUD operations for games and players. Example: `createGame()` writes `games/<code>` and returns the code.
- `src/services/authService.js` — `loginAdmin`, `loginAnonymous`, `logout` wrappers around Firebase auth.
- `src/hooks/*` — Small hooks encapsulating presentation logic and service usage (`useAuth`, `useGame`, `usePlayer`). Follow their error/return conventions (usually return `{ success: true/false, error }` or set hook state).
- `src/App.jsx` — App-level view logic, routing (via internal `view` state), translations, and the statements dataset.
- `test-firebase.html` — Quick stand-alone Firebase connection test (useful for debugging environment issues).

## Development & debug workflows
- Install: `npm install`.
- Run dev server: `npm run dev` (Vite default port — usually `http://localhost:5173`).
- Build: `npm run build`.
- Preview production build: `npm run preview`.
- Quick Firebase check: open `test-firebase.html` in browser — it signs in anonymously and writes a document.
- Debugging tips:
  - There's extensive console logging across services/hooks; watch browser console for helpful messages (e.g., '🔐 Auth state changed', '📥 Real-time update').
  - For Firestore structure, check the `games` collection; game docs are keyed by the generated code (e.g. "ABC123").

## Conventions and things agents must follow
- File naming: React components PascalCase, hooks start with `use` (camelCase), services are plain camelCase (`gameService.js`).
- Imports are relative (no alias configured); do not assume `@/` or other path aliases.
- UI text is localized in `App.jsx` via `translations` object (supports `en` and `no` locales). If changing copy, update both locales.
- Player session persistence is via `sessionStorage` key `playerSession`. Respect restore/clear behavior in `usePlayer` when implementing features.
- Real-time behavior: prefer using existing `onSnapshot` subscriptions (`useGame`) instead of polling.
- Error handling style: hooks tend to set `error` state and return `{ success: false, error }`. Preserve this pattern when adding new hooks or features.

## What to avoid
- Do not remove the fallback Firebase values in `src/lib/firebase.js` without confirming environment usage — they're used for quick local checks.
- Don't assume tests exist — there are no test scripts defined in `package.json`. If adding tests, keep them co-located under `src/__tests__` and add `npm test` script.

## Example tasks with quick pointers
- Adding a new admin-only page: follow `AdminDashboard.jsx` patterns, use `useAuth` for access control, and call `gameService` for persistence.
- Adding an API-like helper: prefer adding to `src/services/*` and keep functions pure (no UI side-effects).
- Adding i18n strings: add entries to `translations` in `App.jsx` and use `language` state.

---
If anything in these notes is unclear or missing important edge cases, tell me which area to expand (API shapes, example requests/responses, or debugging steps) and I will iterate. ✅
