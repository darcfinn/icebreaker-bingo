# Icebreaker Bingo - Product Roadmap

## Overview
This document outlines planned features and enhancements for the Icebreaker Bingo application. Features are organized by priority and implementation complexity.

---

## Current Version (v1.0)

### ✅ Implemented Features
- Admin authentication with email/password
- Anonymous player access via game codes
- Real-time synchronization across devices
- Direct game URLs for easy sharing
- Multi-language support (English/Norwegian)
- Player sorting by progress or name
- Session persistence for players
- End game functionality (preserves data, blocks new joins)
- Admin dashboard with game management
- 90 unique statements per language
- Duplicate name detection (strict - not allowed with auto-clear on blur)
- BINGO win detection (5 in a row: horizontal, vertical, or diagonal)
- Game status badges (Active/Ended)
- Refactored view components for better maintainability

---

## Future Features

### 🎯 Feature 1: Game Start Control

**Priority:** High  
**Effort:** Medium  
**Target Version:** v1.1

#### Description
Add a "waiting room" mode where players can join but cannot start filling in names until the admin clicks "Start Game". This ensures all participants begin at the same time.

#### User Story
*"As an admin, I want to control when the game officially starts, so that all players have a fair chance and begin simultaneously."*

#### Requirements

**Functional Requirements:**
- Admin sees "Start Game" button when game is created
- Players who join before start see "Waiting for admin to start..." message
- Players can see their bingo board but inputs are disabled
- When admin clicks "Start", all players' inputs are enabled simultaneously
- Real-time notification to all players when game starts

**Game States:**
- `pending` - Game created, waiting for admin to start
- `active` - Game is running, players can fill squares
- `ended` - Game finished, no new players or edits

**UI Requirements:**
- Admin dashboard: "Start Game" button (green, prominent)
- Player view: Waiting state with countdown/message
- Toast notification when game starts
- Disable input fields until game starts

**Technical Implementation:**
```javascript
// Firestore game document
{
  status: 'pending' | 'active' | 'ended',
  startedAt: timestamp | null,
  startedBy: adminId | null
}

// Service function
export const startGame = async (gameId) => {
  await updateDoc(doc(db, 'games', gameId), {
    status: 'active',
    startedAt: serverTimestamp(),
    startedBy: currentUser.uid
  });
};
```

#### Success Criteria
- Admin can start game with one click
- All players receive instant notification
- Inputs unlock simultaneously for all players
- Game state persists correctly

---

### 🎯 Feature 2: "I Got BINGO!" Button & Winner Race

**Priority:** High  
**Effort:** Medium-High  
**Target Version:** v1.1

#### Description
Instead of automatic BINGO detection, players must click an "I Got BINGO!" button when they complete a winning pattern. First to click wins. Multiple winners are ranked by timestamp.

#### User Story
*"As a player, I want to click a button to claim my BINGO, so there's excitement and competition to be the first winner."*

#### Requirements

**Functional Requirements:**
- Button appears only when player has valid BINGO pattern
- First click registers as winner
- Subsequent clicks register as 2nd, 3rd place, etc.
- Timestamps recorded for each claim
- Admin sees ranking in real-time
- Players see their rank after claiming

**UI Requirements:**
- Large, animated "I GOT BINGO!" button appears when pattern complete
- Fireworks/celebration animation on click
- "You won 1st place!" confirmation message
- Admin view shows winner order with timestamps
- Badge/trophy icons for 1st/2nd/3rd place

**Technical Implementation:**
```javascript
// Firestore player document
{
  bingoClaimedAt: timestamp | null,
  bingoRank: number | null, // 1, 2, 3, etc.
}

// Firestore game document
{
  winners: [
    { playerId, playerName, rank: 1, claimedAt: timestamp },
    { playerId, playerName, rank: 2, claimedAt: timestamp },
  ]
}

// Service function
export const claimBingo = async (gameId, playerId, playerName) => {
  const gameRef = doc(db, 'games', gameId);
  const gameSnap = await getDoc(gameRef);
  const game = gameSnap.data();
  
  const currentWinners = game.winners || [];
  const rank = currentWinners.length + 1;
  
  await updateDoc(gameRef, {
    winners: arrayUnion({
      playerId,
      playerName,
      rank,
      claimedAt: serverTimestamp()
    }),
    [`players.${playerId}.bingoClaimedAt`]: serverTimestamp(),
    [`players.${playerId}.bingoRank`]: rank
  });
};
```

#### Success Criteria
- Button only appears with valid BINGO
- First click gets rank 1
- Multiple winners properly ranked
- Timestamps accurate to millisecond
- UI clearly shows winner status

---

### 🎯 Feature 3: Configurable BINGO Win Conditions

**Priority:** Medium  
**Effort:** Medium  
**Target Version:** v1.2

#### Description
Allow admins to configure what counts as a BINGO: classic (5 in a row), blackout (full card), patterns (X, +, corners), or custom requirements.

#### User Story
*"As an admin, I want to choose different win conditions, so I can adjust game difficulty and duration for different events."*

#### Win Condition Options

**1. Classic (Default)**
- 5 in a row (horizontal, vertical, or diagonal)
- Current behavior

**2. Multiple Lines**
- Require 2, 3, 4, or 5 lines to win
- Good for longer events

**3. Blackout**
- All 25 squares filled
- Maximum difficulty

**4. Patterns**
- Four Corners
- X Pattern (both diagonals)
- Plus Pattern (middle row + middle column)
- Frame (outer edge)

**5. Custom**
- Admin specifies number of completed lines

**Technical Implementation:**
```javascript
// Game settings
{
  winCondition: {
    type: 'classic' | 'multiple' | 'blackout' | 'pattern' | 'custom',
    linesRequired: number, // for multiple/custom
    pattern: 'corners' | 'x' | 'plus' | 'frame' // for pattern type
  }
}

// Updated checkWin function
const checkWin = (names, winCondition) => {
  switch (winCondition.type) {
    case 'classic':
      return checkClassicBingo(names);
    case 'multiple':
      return countLines(names) >= winCondition.linesRequired;
    case 'blackout':
      return Object.keys(names).length === 25;
    case 'pattern':
      return checkPattern(names, winCondition.pattern);
    default:
      return checkClassicBingo(names);
  }
};
```

#### UI for Configuration
- Dropdown in game creation: "Win Condition"
- Preview of selected pattern
- Explanation text for each option
- Players see win condition requirement in game

#### Success Criteria
- Admin can select win condition during game creation
- Win detection works correctly for all types
- Players see clear indication of requirements
- Pattern visuals are intuitive

---

### 🎯 Feature 4: Dark Mode

**Priority:** Medium  
**Effort:** Low-Medium  
**Target Version:** v1.2

#### Description
Add dark theme support with toggle, improving usability in low-light environments and reducing eye strain.

#### Requirements

**Functional Requirements:**
- Toggle between light and dark themes
- Preference saved in localStorage
- Applies across all views
- Smooth transition animations
- WCAG AA contrast compliance in both modes

**Color Palette:**
```css
/* Dark Mode Colors */
--bg-primary: #1a1a2e
--bg-secondary: #16213e
--bg-card: #0f3460
--text-primary: #e9e9e9
--text-secondary: #a8a8a8
--accent-primary: #6c63ff
--accent-secondary: #bb86fc
```

**Technical Implementation:**
- Tailwind dark mode with class strategy
- Context for theme state
- CSS variables for colors
- Moon/sun icon toggle

#### Success Criteria
- Toggle works instantly
- All views properly styled in dark mode
- Preference persists across sessions
- Accessible contrast ratios maintained

---

### 🎯 Feature 5: Display Game Name in Player View

**Priority:** Low  
**Effort:** Low  
**Target Version:** v1.1

#### Description
Show the game name in the player's bingo board view so they know which game they're playing.

#### Requirements
- Display game name in header
- Show game code as well
- Responsive design (truncate long names)
- Fetch from currentGame state

**Implementation:**
```javascript
// PlayerGame.jsx header
<div>
  <h1 className="text-3xl font-bold text-indigo-600">
    {currentGame.name}
  </h1>
  <p className="text-sm text-gray-500">
    Game Code: {currentGameId} • Playing as: {playerName}
  </p>
</div>
```

#### Success Criteria
- Game name visible in player view
- Updates in real-time if admin changes it
- Doesn't break layout on mobile

---

### 🎯 Feature 6: Configurable Duplicate Name Policy

**Priority:** Medium  
**Effort:** Low  
**Target Version:** v1.2

#### Description
Allow admins to configure how duplicate names are handled in games.

#### Options:
1. **Not Allowed** (current default) - Prevent duplicate names entirely, show error, auto-clear on blur
2. **Allowed with Warning** - Show warning but allow duplicate
3. **Allowed** (permissive) - No warning, fully allowed

#### Implementation:
- Add `duplicateNamePolicy` field to game settings
- Store in Firestore game document
- Update `toggleSquare` logic to respect policy
- Add dropdown in game creation form

---

### 🎯 Feature 7: Winner Timestamps in Admin View

**Priority:** Medium  
**Effort:** Low  
**Target Version:** v1.1

#### Description
Show timestamp when each player claimed BINGO in admin game view.

#### Requirements
- Display timestamp next to BINGO badge
- Format: "Won at 14:32:15" or relative time "Won 2 minutes ago"
- Include rank badge (🥇🥈🥉) for top 3
- Sort option: by rank or by name

**UI Design:**
```
Player Name                  Progress      Status
─────────────────────────────────────────────────────
Alice Johnson               25/25         🥇 BINGO! (14:32:15)
Bob Smith                   25/25         🥈 BINGO! (14:32:18)
Charlie Brown               23/25         Playing...
```

#### Success Criteria
- Timestamps accurate and readable
- Rank badges display correctly
- Sortable by win time

---

## Custom Statements Features (from v1.1 plan)

### 🎯 Feature: Custom Statements by Admin

**Priority:** High  
**Effort:** Medium  
**Target Version:** v1.1

[Content from original roadmap - keeping as is]

---

### 🎯 Feature: Database-Backed Statements & Translations

**Priority:** Medium  
**Effort:** High  
**Target Version:** v1.2

[Content from original roadmap - keeping as is]

---

### 🎯 Feature: Statement Set Selection

**Priority:** High  
**Effort:** Low  
**Target Version:** v1.1

[Content from original roadmap - keeping as is]

---

## Technical Debt & Improvements

### Code Quality
- [x] Extract view components (Landing, AdminLogin, AdminDashboard, AdminGameView, PlayerJoin, PlayerGame)
- [ ] Extract reusable UI components (Button, Input, Card)
- [ ] Extract game-specific components (BingoBoard, PlayerCard, GameStatusBadge, WinnerBadge)
- [ ] Complete TypeScript migration (currently JavaScript)
- [ ] Add unit tests (Jest + React Testing Library)
- [ ] Add E2E tests (Playwright/Cypress)
- [ ] Error boundary implementation
- [ ] Loading states standardization
- [ ] Accessibility audit (WCAG 2.1 AA compliance)

### Performance
- [ ] Lazy load views (React.lazy + Suspense)
- [ ] Optimize Firestore queries (use indexes)
- [ ] Image optimization (if adding graphics)
- [ ] Bundle size optimization
- [ ] Performance monitoring (Firebase Performance)

### DevOps
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated testing in pipeline
- [ ] Staging environment
- [ ] Error tracking (Sentry/LogRocket)
- [ ] Analytics integration (Google Analytics/Mixpanel)

---

## Nice-to-Have Features (Backlog)

### User Experience
- [ ] QR code generation for easy game joining
- [ ] Game history and statistics dashboard
- [ ] Export game results (CSV/PDF)
- [ ] Email notifications when someone gets BINGO
- [ ] Sound effects and animations
- [x] Dark mode support (moved to v1.2)
- [ ] Mobile app (React Native)
- [ ] Confetti animation on BINGO

### Admin Features
- [ ] Game templates (save configuration as template)
- [ ] Duplicate existing game
- [ ] Bulk game creation
- [ ] Player analytics (engagement metrics)
- [ ] Custom branding (logo, colors per game)
- [ ] Scheduled games (set start/end times)
- [ ] Game timer/countdown

### Player Features
- [ ] Player profiles (optional, track stats across games)
- [ ] Achievement badges
- [ ] Leaderboard across multiple games
- [ ] Social sharing (share BINGO on social media)
- [ ] Hints system (suggest people to talk to)
- [ ] Photo upload (add photo to filled square)

### Social & Collaboration
- [ ] Team tournaments (multiple games, aggregate scores)
- [ ] Public game discovery (opt-in public games)
- [ ] Share statement libraries between admins
- [ ] Community voting on best statements
- [ ] Integration with Slack/Teams for notifications
- [ ] Live chat during games

---

## Implementation Phases

### Phase 1: Game Control & Competition (v1.1)
**Timeline:** 2-3 weeks  
**Priority Features:**
1. Game Start Control (waiting room)
2. "I Got BINGO!" button with winner race
3. Winner timestamps & ranking
4. Display game name in player view

**Deliverables:**
- Start/Stop game controls
- BINGO claim system with ranking
- Enhanced admin view with timestamps
- Better player experience

---

### Phase 2: Customization & Flexibility (v1.2)
**Timeline:** 3-4 weeks  
**Priority Features:**
1. Configurable BINGO win conditions
2. Custom statements by admin
3. Statement set selection
4. Duplicate name policy options
5. Dark mode

**Deliverables:**
- Flexible game rules
- Custom content management
- Theme support
- Better UX options

---

### Phase 3: Content & Scaling (v1.3)
**Timeline:** 3-4 weeks  
**Priority Features:**
1. Database-backed statements & translations
2. Curated statement sets
3. Performance optimizations
4. Testing infrastructure

**Deliverables:**
- Dynamic content system
- Multi-language framework
- Unit & E2E tests
- Optimized performance

---

## Version History

### v1.0 (Current) - January 2025
- Initial release
- Core gameplay functionality
- Admin and player flows
- Real-time synchronization
- Bilingual support (EN/NO)
- Refactored architecture with view components

### v1.1 (Planned) - Q1 2025
- Game start control
- BINGO claim button & winner race
- Winner timestamps & ranking
- Game name in player view
- Custom statements by admin
- Statement set selection
- Enhanced admin dashboard

### v1.2 (Planned) - Q2 2025
- Configurable win conditions
- Duplicate name policy options
- Dark mode
- Database-backed content
- Multi-language framework (3+ languages)
- Performance optimizations
- TypeScript migration

### v1.3 (Planned) - Q3 2025
- Curated statement sets
- Analytics dashboard
- QR code support
- Export functionality
- Testing suite complete

---

## Contributing

Want to contribute to the roadmap? 

1. Review existing features and their priorities
2. Propose new features via GitHub Issues
3. Discuss technical approach in pull requests
4. Follow the project's coding standards

---

## Feedback

Have ideas for new features? Contact the team or create an issue in the repository.

**Priority Definitions:**
- **High**: Critical for user value, should be implemented soon
- **Medium**: Valuable but not urgent
- **Low**: Nice to have, implement when resources available

**Effort Definitions:**
- **Low**: < 1 week
- **Medium**: 1-3 weeks  
- **High**: 3+ weeks

---

*Last Updated: January 2026*  
*Maintained by: Dagfinn @ EC Engineering Team*
