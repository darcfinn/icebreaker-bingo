# Icebreaker Bingo - Project Structure Documentation

## Overview
Real-time multiplayer icebreaker bingo game built with Vite, React, Tailwind CSS, and Firebase. Single-page application (SPA) with admin and player modes, featuring real-time synchronization, bilingual support, and refactored view-based architecture.

**Last Major Refactor:** January 2026 - Extracted views from monolithic App.jsx

---

## Root Level Files
- `package.json` - Dependencies and npm scripts
- `package-lock.json` - Locked dependency versions
- `vite.config.js` - Vite bundler configuration
- `tailwind.config.js` - Tailwind CSS customization
- `postcss.config.js` - PostCSS plugins (Tailwind processing)
- `index.html` - Entry HTML file (Vite serves from root)
- `test-firebase.html` - Firebase integration testing page
- `.env.local` - Environment variables (Firebase config, **never commit**)
- `.gitignore` - Git ignore rules
- `.DS_Store` - macOS system file (**should be in .gitignore**)
- `README.md` - User-facing documentation

---

## Directory Structure

### `/src` - Application Source Code
Primary application code directory containing all React components, hooks, services, and data.

```
/src
  App.jsx                 # Main app coordinator (routing & state)
  main.jsx                # Application entry point
  /views                  # Full-page view components
    LandingPage.jsx       # Landing page with admin/player options
    AdminLogin.jsx        # Admin email/password login
    AdminDashboard.jsx    # Admin game list & creation
    AdminGameView.jsx     # Detailed game view with player list
    PlayerJoin.jsx        # Player join screen (code + name)
    PlayerGame.jsx        # Bingo board game interface
  /hooks                  # Custom React hooks
    useAuth.js            # Authentication state/logic
    useGame.js            # Game management operations
    usePlayer.js          # Player operations and board management
  /services               # Business logic layer
    gameService.js        # Game CRUD operations (Firestore)
  /lib                    # Third-party configurations
    firebase.js           # Firebase initialization
  /data                   # Static data and translations
    statements.js         # Bingo statements (EN/NO)
    translations.js       # UI text translations (EN/NO)
  /styles                 # Global styles (if any)
    (global.css)          # Future: Global CSS overrides
```

---

## Refactored Architecture (v1.0)

### Previous State (Before Refactoring)
- **Single monolithic component:** All views in App.jsx (~900+ lines)
- **Conditional rendering:** All UI in one massive file
- **Hard to maintain:** Difficult to find specific views
- **No code reusability:** Everything coupled together

### Current State (After Refactoring)
- **View-based architecture:** 6 separate view components
- **Clean separation:** Each view is self-contained
- **App.jsx as coordinator:** ~400-500 lines, handles routing & state
- **Easy to maintain:** Find any view in seconds
- **Scalable:** Easy to add new views

---

## Component Architecture

### App.jsx - Main Coordinator
**Responsibilities:**
- View routing (which view to show)
- Global state management (auth, language, games)
- Business logic (login, create game, join game)
- Firebase listeners and subscriptions
- Prop drilling to view components

**Structure:**
```javascript
import React, { useState, useEffect } from 'react';
import { Firebase imports }
import { Custom hooks }
import { View components }
import { Data imports }

const App = () => {
  // State management
  const [view, setView] = useState('landing');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Custom hooks
  const { currentUser, isAdmin, ... } = useAuth();
  const game = useGame(currentUser, isAdmin);
  const player = usePlayer(translations, language);
  
  // Business logic functions
  const handleAdminLogin = async (email, password) => { ... };
  const createGame = async (gameName) => { ... };
  const joinGameAsPlayer = async (gameCode, name) => { ... };
  
  // View rendering (clean routing)
  if (view === 'landing') return <LandingPage {...props} />;
  if (view === 'adminLogin') return <AdminLogin {...props} />;
  if (view === 'adminDashboard') return <AdminDashboard {...props} />;
  if (view === 'adminGameView') return <AdminGameView {...props} />;
  if (view === 'playerJoin') return <PlayerJoin {...props} />;
  if (view === 'playerGame') return <PlayerGame {...props} />;
  
  return null;
};
```

**Key Features:**
- ✅ Clean view routing
- ✅ Centralized state management
- ✅ Business logic abstraction
- ✅ Prop-based communication with views

---

## View Components

### 1. LandingPage.jsx
**Purpose:** Entry point with admin/player choice

**Props:**
- `currentUser`, `isAdmin` - Auth state
- `language`, `translations` - Localization
- `onNavigate` - Navigate to other views
- `onLanguageToggle` - Switch language
- `onAdminLogout` - Logout (if already logged in)

**Features:**
- Two main cards: Admin Login / Join as Player
- Language toggle
- Shows logged-in admin status
- Responsive design

---

### 2. AdminLogin.jsx
**Purpose:** Email/password authentication for admins

**Props:**
- `translations`, `language` - Localization
- `loading`, `error` - UI state
- `onLogin(email, password)` - Login callback
- `onBack` - Return to landing

**Local State:**
- `adminEmail`, `adminPassword` - Form inputs

**Features:**
- Email/password inputs
- Enter key submission
- Error display
- Loading state
- Back button (X)

---

### 3. AdminDashboard.jsx
**Purpose:** Admin's game management hub

**Props:**
- `currentUser` - User info
- `language`, `translations` - Localization
- `myGames` - List of admin's games
- `loading` - UI state
- `onLanguageToggle` - Switch language
- `onLogout` - Logout
- `onCreateGame(gameName)` - Create new game
- `onViewGame(gameId)` - Open game view
- `onEndGame(gameId)` - End a game
- `onDeleteGame(gameId)` - Delete a game
- `onCopyGameLink(gameId)` - Copy game URL

**Local State:**
- `newGameName` - Game creation input

**Features:**
- Create new game form
- List of all admin's games
- Game status badges (Active/Ended)
- Quick actions (View, End, Delete, Copy Link)
- Player count display
- Language toggle

---

### 4. AdminGameView.jsx
**Purpose:** Detailed view of a specific game

**Props:**
- `currentGame`, `currentGameId` - Game data
- `language`, `translations` - Localization
- `loading` - UI state
- `checkWin(names)` - Win detection function
- `copied` - Copy link feedback state
- `onRefresh` - Manual refresh button
- `onCopyLink` - Copy game URL
- `onBack` - Return to dashboard

**Local State:**
- `playerSortBy` - Sort by progress/name
- `playerSortOrder` - Sort asc/desc

**Features:**
- Game name and code display
- Real-time player list
- Player progress bars
- BINGO detection and trophy display
- Sortable player list
- Refresh button
- Copy link button

---

### 5. PlayerJoin.jsx
**Purpose:** Player entry screen with game code & name

**Props:**
- `currentUser`, `isAdmin` - Auth state
- `language`, `translations` - Localization
- `loading`, `error` - UI state
- `prefilledGameCode` - Code from URL parameter
- `onJoinGame(code, name)` - Join callback
- `onLanguageToggle` - Switch language
- `onBack` - Return to landing
- `onLogout` - Logout (if admin trying to play)

**Local State:**
- `gameCode` - Game code input
- `playerName` - Player name input

**Features:**
- Game code input (auto-uppercase)
- Player name input
- Enter key submission
- Pre-filled code detection from URL
- Admin blocking (can't play as admin)
- Language toggle
- Error display

---

### 6. PlayerGame.jsx
**Purpose:** Main bingo board game interface

**Props:**
- `playerName` - Player's name
- `playerBoard` - Array of 25 statements
- `playerNames` - Object of filled squares {index: name}
- `currentGameId`, `playerId` - Game/player IDs
- `language`, `translations` - Localization
- `duplicateWarning` - Duplicate name warning message
- `hasWon` - Boolean if player has BINGO
- `onToggleSquare(index, name, gameId, playerId, shouldUpdate)` - Fill square
- `onGenerateNewBoard` - Generate new random board
- `onLeaveGame` - Leave and return to join screen

**Features:**
- 5x5 bingo grid
- Input fields in each square
- Real-time duplicate name detection
- Auto-clear on blur if duplicate
- Win detection (5 in a row)
- Win celebration message
- Progress counter (filled/25)
- Generate new board button
- Leave game button

---

## Custom Hooks

### useAuth.js
**Purpose:** Authentication state and operations

**Returns:**
```javascript
{
  currentUser,           // Firebase user object or null
  isAdmin,              // Boolean: is user an admin (has email)
  loginAdmin,           // Function: (email, password) => Promise
  loginAnonymous,       // Function: () => Promise (for players)
  logout                // Function: () => Promise
}
```

**State:**
- `currentUser` - Current Firebase auth user
- `isAdmin` - Computed from currentUser.email

**Features:**
- Firebase auth state listener
- Admin login with email/password
- Anonymous login for players
- Logout function
- Auto-cleanup on unmount

---

### useGame.js
**Purpose:** Game management and operations

**Parameters:**
- `currentUser` - Current user object
- `isAdmin` - Boolean if user is admin

**Returns:**
```javascript
{
  currentGameId,        // Currently viewed game ID
  currentGame,          // Currently viewed game data
  myGames,             // Array of admin's games
  setCurrentGameId,    // Function to set current game
  setCurrentGame,      // Function to set current game data
  loadMyGames          // Function to load admin's games
}
```

**State:**
- `currentGameId` - Active game code
- `currentGame` - Active game data object
- `myGames` - List of games created by admin

**Features:**
- Load admin's games from Firestore
- Real-time game updates via onSnapshot
- Set/clear current game
- Game data caching

---

### usePlayer.js
**Purpose:** Player game logic and board management

**Parameters:**
- `translations` - Translation object
- `language` - Current language code

**Returns:**
```javascript
{
  playerName,              // Player's display name
  playerId,               // Unique player ID
  playerBoard,            // Array of 25 statements
  playerNames,            // Object {index: name} of filled squares
  duplicateWarning,       // Warning message or false
  playerSessionRestored,  // Boolean if session was restored
  setPlayerName,          // Setter
  setPlayerId,            // Setter
  setPlayerBoard,         // Setter
  setPlayerNames,         // Setter
  setDuplicateWarning,    // Setter
  setPlayerSessionRestored, // Setter
  toggleSquare,           // Function to fill/clear square
  checkWin,               // Function to check BINGO
  saveSession,            // Save to sessionStorage
  clearSession,           // Clear sessionStorage
  restoreSession          // Restore from sessionStorage
}
```

**State:**
- `playerName` - Player's name
- `playerId` - Unique ID (timestamp)
- `playerBoard` - 25 random statements
- `playerNames` - Filled squares mapping
- `duplicateWarning` - Warning message
- `playerSessionRestored` - Session restore flag

**Key Functions:**

**toggleSquare(index, name, gameId, playerId, shouldUpdate)**
- Validates and fills/clears a square
- Checks for duplicate names (case-insensitive)
- Shows translated warning for duplicates
- Auto-clears duplicate names on blur
- Optionally persists to Firebase
- Returns true/false for success

**checkWin(names)**
- Checks for 5 in a row (horizontal, vertical, diagonal)
- Returns boolean

**Session Management:**
- Saves to sessionStorage for persistence
- Restores on page refresh
- Clears on leave game

---

## Services Layer

### gameService.js
**Purpose:** Firebase Firestore operations for games

**Exported Functions:**

```javascript
// Create a new game
export const createGame = async (gameData) => {
  // Generates game code
  // Creates Firestore document
  // Returns game code
};

// Get a game by ID
export const getGame = async (gameId) => {
  // Fetches game from Firestore
  // Returns game data or null
};

// Update player progress
export const updatePlayerProgress = async (gameId, playerId, names) => {
  // Updates player's filled squares
  // Persists to Firestore
};

// End a game
export const endGame = async (gameId) => {
  // Sets status to 'ended'
  // Blocks new players
};

// Delete a game
export const deleteGame = async (gameId) => {
  // Removes game document
  // Deletes all data
};
```

**Error Handling:**
- All functions use try-catch
- Console logging for debugging
- Returns null on errors

---

## Data Files

### statements.js
**Purpose:** Bingo statement content

**Structure:**
```javascript
export const statements = {
  en: [
    "Has traveled to 5+ countries",
    "Loves pizza",
    // ... 90 statements total
  ],
  no: [
    "Har reist til 5+ land",
    "Elsker pizza",
    // ... 90 statements total
  ]
};
```

**Usage:**
- Used to generate random bingo boards
- 25 statements selected randomly per board
- Future: Move to Firestore database

---

### translations.js
**Purpose:** UI text translations

**Structure:**
```javascript
export const translations = {
  en: {
    appTitle: "Icebreaker Bingo",
    tagline: "Break the ice, build connections",
    adminLogin: "Admin Login",
    participate: "Join as Player",
    // ... 50+ translation keys
  },
  no: {
    appTitle: "Icebreaker Bingo",
    tagline: "Bryt isen, bygg relasjoner",
    adminLogin: "Admin-pålogging",
    participate: "Delta som spiller",
    // ... 50+ translation keys
  }
};
```

**Usage:**
```javascript
const transText = translations[language] || translations.en;
console.log(transText.appTitle); // "Icebreaker Bingo"
```

**Key Translation Keys:**
- UI labels: `appTitle`, `tagline`, `adminLogin`, `participate`
- Actions: `login`, `logout`, `create`, `join`, `delete`
- Messages: `loading`, `error`, `success`, `invalidCode`
- Game content: `instructions`, `winMessage`, `duplicateWarning`
- Confirmations: `confirmLeaveGame`, `confirmDelete`, `confirmEndGame`

---

## Firebase Structure

### Firestore Collections

#### `/games/{gameId}`
```javascript
{
  id: "ABC123",              // 6-char uppercase alphanumeric
  name: "Team Lunch Bingo",  // Game display name
  language: "en" | "no",     // Game language
  adminId: "user_uid",       // Creator's Firebase UID
  adminEmail: "admin@...",   // Creator's email
  status: "active" | "ended", // Game status
  createdAt: timestamp,      // Creation time
  players: {
    "1234567890": {          // Player ID (timestamp)
      id: "1234567890",
      name: "Alice",
      board: [...],          // 25 statements
      names: {
        0: "Bob",            // Filled squares
        5: "Charlie"
      },
      joinedAt: timestamp
    }
  }
}
```

**Indexes Required:**
- `adminId` + `createdAt` (for loading admin's games)
- `status` (for filtering active/ended games)

---

### Authentication
- **Admins**: Email/Password authentication
  - Stored in Firebase Auth
  - Email verified
- **Players**: Anonymous authentication
  - Temporary Firebase Auth user
  - No persistent account
  - Session-based only

---

### Security Rules (Firestore)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      // Anyone can read games
      allow read: if true;
      
      // Only authenticated users can create
      allow create: if request.auth != null;
      
      // Only game admin can update/delete
      allow update, delete: if request.auth.uid == resource.data.adminId;
    }
  }
}
```

---

## Environment Variables

### Required Variables
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abcdef
```

**Security Notes:**
- Use `.env.local` for local development
- Never commit `.env.local` to Git
- Add `.env.local` to `.gitignore`
- Vite requires `VITE_` prefix for client-side variables
- Firebase keys are safe to expose client-side (protected by security rules)

---

## File Naming Conventions

### Components & Views
- **PascalCase**: `LandingPage.jsx`, `AdminDashboard.jsx`, `PlayerGame.jsx`
- **Descriptive names**: Clearly indicate purpose
- **Suffix with purpose**: `Page`, `View`, `Form`, `Card`, `List`

### Hooks
- **camelCase with 'use' prefix**: `useAuth.js`, `useGame.js`, `usePlayer.js`
- **Purpose-focused**: Each hook has single responsibility
- **Pure functions**: Return values and functions only

### Services
- **camelCase**: `gameService.js`, `authService.js`
- **Named exports**: `export const createGame = ...`
- **Async functions**: All return Promises

### Data Files
- **camelCase**: `statements.js`, `translations.js`
- **Named exports**: `export const statements = ...`
- **Structured data**: Objects or arrays

### Variables & Constants
- **camelCase for variables**: `playerName`, `currentGame`, `hasWon`
- **Descriptive names**: Minimum 3-5 characters (except loop indices)
- **Boolean prefix**: `is`, `has`, `should` (e.g., `isAdmin`, `hasWon`)
- **Arrays pluralized**: `myGames`, `players`, `statements`

---

## Development Workflow

### Starting Development
```bash
npm install              # Install dependencies
npm run dev             # Start dev server (http://localhost:5173)
```

### Building for Production
```bash
npm run build           # Build optimized bundle to /dist
npm run preview         # Preview production build locally
```

### Git Workflow
```bash
git checkout -b feature/new-view    # Create feature branch
# Make changes
git add .
git commit -m "Add new view"
git push origin feature/new-view
# Create pull request
```

---

## Deployment

### Vercel (Current)
- **Automatic deployment** on push to `main` branch
- Environment variables configured in Vercel dashboard
- Build command: `npm run build`
- Output directory: `dist`
- Deployed URL: `https://icebreaker-bingo-tau.vercel.app`

### Firebase Hosting (Alternative)
```bash
npm run build
firebase deploy
```

---

## Testing Strategy (Future)

### Recommended Testing Structure
```
/src
  /__tests__                  # Test files
    /views
      LandingPage.test.jsx
      AdminLogin.test.jsx
    /hooks
      useAuth.test.js
      useGame.test.js
      usePlayer.test.js
    /services
      gameService.test.js
  /test-utils
    testHelpers.js
    mockFirebase.js
```

### Testing Tools (To be added)
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright or Cypress
- **Firebase Testing**: Firebase Emulator Suite
- **Coverage**: Jest coverage reports
- **CI/CD**: GitHub Actions for automated testing

### Test Coverage Goals
- **Views**: Render tests, user interaction
- **Hooks**: State management, side effects
- **Services**: Firestore operations, error handling
- **Utils**: Pure function testing

---

## Performance Considerations

### Current Optimizations
- ✅ Vite for fast HMR and optimized builds
- ✅ Tailwind CSS with PurgeCSS for minimal CSS bundle
- ✅ Real-time Firestore listeners (efficient updates)
- ✅ Component-based architecture (better tree-shaking)
- ✅ Session storage for player persistence

### Future Optimizations
- ⚠️ Code splitting with React.lazy()
- ⚠️ Route-based lazy loading
- ⚠️ Image optimization (if adding images)
- ⚠️ Memoization for expensive computations
- ⚠️ Service Worker for offline support
- ⚠️ Bundle size monitoring

### Performance Metrics
- **Target bundle size**: < 500KB gzipped
- **Target load time**: < 2 seconds on 3G
- **Target FCP**: < 1.5 seconds
- **Target TTI**: < 3 seconds

---

## Accessibility Guidelines

### Current State
- ⚠️ Semantic HTML in some places
- ⚠️ Keyboard navigation partially supported
- ❌ No ARIA labels
- ❌ No screen reader testing
- ❌ No focus management

### Recommended Improvements
1. **Semantic HTML**
   - Use proper heading hierarchy (h1, h2, h3)
   - Use `<button>` for actions, not `<div>`
   - Use `<nav>`, `<main>`, `<section>` landmarks

2. **Keyboard Navigation**
   - All interactive elements focusable
   - Logical tab order
   - Escape key to close modals
   - Enter key for form submission

3. **ARIA Labels**
   - `aria-label` for icon-only buttons
   - `aria-describedby` for error messages
   - `aria-live` for dynamic content
   - `role` attributes where needed

4. **Screen Readers**
   - Test with NVDA, JAWS, VoiceOver
   - Announce state changes
   - Descriptive link text

5. **Color Contrast**
   - WCAG AA compliance (4.5:1 for text)
   - Don't rely on color alone
   - Test with color blindness simulators

6. **Focus Management**
   - Visible focus indicators
   - Restore focus after modal closes
   - Skip links for navigation

---

## Security Best Practices

### Current Implementation
- ✅ Environment variables for Firebase config
- ✅ Admin authentication with email/password
- ✅ Anonymous authentication for players
- ✅ Firestore security rules (admin-only write)
- ✅ Input sanitization (trim, validation)

### Recommended Enhancements
- **Input Validation**
  - Validate all user inputs
  - Sanitize before displaying
  - Max length enforcement
  - XSS prevention

- **Rate Limiting**
  - Limit game creation per admin
  - Throttle Firebase operations
  - Prevent spam/abuse

- **Authentication**
  - Email verification for admins
  - Password strength requirements
  - Account recovery flow
  - Session timeout

- **Data Privacy**
  - GDPR compliance
  - Data deletion requests
  - Anonymous data handling
  - Privacy policy

- **Monitoring**
  - Error tracking (Sentry)
  - Security audit logs
  - Suspicious activity alerts
  - Regular security updates

---

## Code Quality Standards

### Linting & Formatting (To be added)
```bash
# Install ESLint
npm install --save-dev eslint @eslint/js eslint-plugin-react

# Install Prettier
npm install --save-dev prettier

# Pre-commit hooks
npm install --save-dev husky lint-staged
```

### Code Review Checklist
- [ ] Component has single responsibility
- [ ] Props are properly documented
- [ ] No hardcoded strings (use translations)
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Accessible keyboard navigation
- [ ] Mobile responsive
- [ ] No console.logs in production
- [ ] Follows naming conventions

---

## Troubleshooting

### Common Issues

**1. Firebase Connection Errors**
```
Error: CORS policy blocked
```
**Solution:** This is normal with Firebase long-polling. Ignore if real-time sync works.

**2. Duplicate Warning Not Showing**
```
Warning box appears but is empty
```
**Solution:** Ensure `duplicateWarning` state is properly destructured from `usePlayer` hook.

**3. Language Not Persisting**
```
Language resets on page refresh
```
**Solution:** Language is not saved to localStorage. Session-based only. Feature request for persistence.

**4. Session Not Restoring**
```
Player refresh loses progress
```
**Solution:** Check sessionStorage is enabled. Works in incognito mode now.

**5. Build Fails**
```
Module not found
```
**Solution:** Check import paths. Use relative imports (`./` or `../`) for local files.

---

## Migration Path to TypeScript

### Phase 1: Setup
```bash
npm install --save-dev typescript @types/react @types/react-dom
```

### Phase 2: Rename Files
- `.jsx` → `.tsx`
- `.js` → `.ts`

### Phase 3: Add Types
```typescript
// Define interfaces
interface Player {
  id: string;
  name: string;
  board: string[];
  names: Record<number, string>;
  joinedAt: string;
}

interface Game {
  id: string;
  name: string;
  language: 'en' | 'no';
  status: 'active' | 'ended';
  players: Record<string, Player>;
}
```

### Phase 4: Type Props
```typescript
interface AdminDashboardProps {
  currentUser: User | null;
  language: 'en' | 'no';
  translations: Translations;
  myGames: Game[];
  loading: boolean;
  onCreateGame: (name: string) => void;
  // ... other props
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ ... }) => {
  // Component logic
};
```

---

## Related Documentation

- [README.md](../README.md) - User-facing documentation
- [ROADMAP.md](./ROADMAP.md) - Feature roadmap and future plans
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## Changelog

### v1.0.1 - January 2026 (Refactoring)
- **Major architectural refactor**
- Extracted 6 view components from monolithic App.jsx
- Improved code organization and maintainability
- Better separation of concerns
- Duplicate name detection with strict policy (auto-clear on blur)
- Enhanced error handling and user feedback

### v1.0.0 - January 2025 (Initial Release)
- Core gameplay functionality
- Admin and player flows
- Real-time synchronization
- Bilingual support (EN/NO)
- Firebase integration
- Vercel deployment

---

## Contributors

**Maintainer:** Dagfinn @ EC Engineering Team  
**Organization:** Quorum Software - EC Engineering  
**Locations:** Stavanger, Pune, Kuala Lumpur

---

## License

[Specify your license - MIT, Apache 2.0, etc.]

---

*Last Updated: January 2026*  
*Version: 1.0.1 (Post-Refactor)*
