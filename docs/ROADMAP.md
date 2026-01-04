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
- Duplicate name detection
- BINGO win detection
- Game status badges (Active/Ended)

---

## Future Features

### 🎯 Feature 1: Custom Statements by Admin

**Priority:** High  
**Effort:** Medium  
**Target Version:** v1.1

#### Description
Allow admins to create and manage their own custom icebreaker statements tailored to their team, organization, or event context.

#### User Story
*"As an admin, I want to create custom statements specific to my team/organization, so the game is more relevant and engaging for my participants."*

#### Requirements

**Functional Requirements:**
- Admins can create, edit, and delete custom statements
- Separate statement sets for each language (English/Norwegian)
- Minimum 25 statements required per language to generate a valid game
- Maximum 200 statements per admin (to prevent abuse)
- Preview statements before saving
- Validate statement uniqueness within admin's collection

**UI Requirements:**
- "Manage Statements" section in admin dashboard
- Add/Edit/Delete interface with form validation
- List view showing all custom statements
- Language selector (create statements for both languages)
- Character limit indicator (max 100 characters per statement)
- Bulk import option (CSV/Excel upload)

**Technical Implementation:**
```javascript
// Firestore Structure
/customStatements/{adminId}
  /en: [
    { id: "stmt_1", text: "Works in the Stavanger office", createdAt: timestamp },
    { id: "stmt_2", text: "Has attended a company hackathon", createdAt: timestamp }
  ]
  /no: [
    { id: "stmt_1", text: "Jobber på Stavanger-kontoret", createdAt: timestamp },
    { id: "stmt_2", text: "Har deltatt på en bedrifts-hackathon", createdAt: timestamp }
  ]
  metadata: {
    totalStatements: 50,
    lastUpdated: timestamp,
    adminEmail: "admin@example.com"
  }
```

**Components to Create:**
- `/src/views/StatementManager.jsx` - Main management interface
- `/src/components/StatementForm.jsx` - Add/edit form
- `/src/components/StatementList.jsx` - Display and manage statements
- `/src/services/statementService.js` - CRUD operations for custom statements

**Security Rules:**
```javascript
// Only admin can read/write their own custom statements
match /customStatements/{adminId} {
  allow read, write: if request.auth.uid == adminId;
}
```

#### Success Criteria
- Admin can add minimum 25 statements per language
- Statements are persisted in Firestore
- Statements appear in game creation flow
- No duplicate statements within admin's collection
- Character limit enforced (100 chars)

---

### 🎯 Feature 2: Database-Backed Statements & Translations

**Priority:** Medium  
**Effort:** High  
**Target Version:** v1.2

#### Description
Move all statements and UI translations from hardcoded constants to Firestore database, enabling dynamic updates without code deployment.

#### Benefits
- Update statements without redeploying application
- Support additional languages dynamically
- Share statement libraries between admins
- A/B test different statement sets
- Community-contributed statement libraries
- Update UI translations for new features instantly

#### Technical Implementation

**Firestore Structure:**
```javascript
/statements
  /library
    /en: {
      statements: [...],
      version: "1.0",
      lastUpdated: timestamp
    }
    /no: {
      statements: [...],
      version: "1.0",
      lastUpdated: timestamp
    }

/translations
  /en: {
    appTitle: "Icebreaker Bingo",
    tagline: "Break the ice, build connections",
    // ... all UI text
    version: "1.0",
    lastUpdated: timestamp
  }
  /no: {
    appTitle: "Icebreaker Bingo",
    tagline: "Bryt isen, bygg relasjoner",
    // ... all UI text
    version: "1.0",
    lastUpdated: timestamp
  }

/statementLibraries (shared/curated sets)
  /professional: { ... }
  /casual: { ... }
  /family: { ... }
  /technical: { ... }
```

**Caching Strategy:**
```javascript
// Cache in localStorage with version checking
const cachedStatements = localStorage.getItem('statements_v1.0');
if (cachedStatements) {
  // Use cached version
} else {
  // Fetch from Firestore and cache
}
```

**Components to Create:**
- `/src/services/contentService.js` - Fetch statements/translations
- `/src/hooks/useStatements.js` - Hook for statement management
- `/src/hooks/useTranslations.js` - Hook for translations
- Admin UI for managing library statements (super-admin only)

**Migration Strategy:**
1. Create Firestore collections with current hardcoded data
2. Update app to fetch from Firestore with fallback to hardcoded
3. Test thoroughly
4. Remove hardcoded data
5. Add admin interface for library management

#### Success Criteria
- App loads statements from Firestore on first load
- Caches for performance (< 100ms load time)
- Fallback to default if Firestore unavailable
- Support for 3+ languages (framework in place)
- Zero downtime during migration

---

### 🎯 Feature 3: Statement Set Selection

**Priority:** High  
**Effort:** Low (depends on Feature 1 & 2)  
**Target Version:** v1.1

#### Description
Allow admins to choose which statement sources to use when creating a game: library statements, custom statements, or a mix of both.

#### User Story
*"As an admin, I want to choose whether to use standard statements, my custom statements, or a combination, so I can tailor the game to my audience."*

#### Statement Source Options

**1. Library Only**
- Use the default 90 library statements
- Best for: General audiences, public events
- No setup required

**2. Custom Only**
- Use only the admin's custom statements
- Best for: Company-specific events, team building
- Requires: Admin has created ≥25 custom statements

**3. Mixed Mode**
- Combine library + custom statements
- Admin chooses ratio (e.g., 60% library, 40% custom)
- Best for: Balanced approach, testing custom statements
- Ensures variety while adding personalization

**4. Curated Sets** (Future)
- Pre-made themed statement collections
- Professional, Casual, Family-friendly, Technical, etc.
- Maintained by platform or community

#### UI/UX Design

**Game Creation Flow:**
```
Step 1: Enter Game Name
Step 2: Choose Language
Step 3: Select Statement Source ⭐ NEW
  ○ Library Statements (90 available)
  ○ My Custom Statements (35 available) [requires ≥25]
  ○ Mixed (choose ratio: [slider: 0% - 100%])
  ○ Curated Set: [dropdown: Professional, Casual, Family, Technical]
  
  [Preview Statements] button
  
Step 4: Create Game
```

**Preview Modal:**
```
Statement Preview
─────────────────
Showing 10 random statements from your selection:

1. Has traveled to 5+ countries
2. Works in the Stavanger office (custom)
3. Loves pizza
4. Has attended a company hackathon (custom)
...

[Regenerate Preview] [Confirm Selection]
```

#### Technical Implementation

**Update Game Schema:**
```javascript
/games/{gameId}
  statementSource: 'library' | 'custom' | 'mixed' | 'curated'
  mixedRatio: 0.6 (60% library, 40% custom) - only if mixed
  curatedSetId: 'professional' - only if curated
  statementSnapshot: [...] - actual 25 statements used (for game consistency)
```

**Update `generateBoard` Function:**
```javascript
const generateBoard = async (lang, source, adminId, mixedRatio = 0.5) => {
  let availableStatements = [];
  
  switch(source) {
    case 'library':
      availableStatements = await getLibraryStatements(lang);
      break;
    case 'custom':
      availableStatements = await getCustomStatements(adminId, lang);
      break;
    case 'mixed':
      const library = await getLibraryStatements(lang);
      const custom = await getCustomStatements(adminId, lang);
      const libraryCount = Math.floor(25 * mixedRatio);
      const customCount = 25 - libraryCount;
      
      const shuffledLibrary = library.sort(() => Math.random() - 0.5);
      const shuffledCustom = custom.sort(() => Math.random() - 0.5);
      
      availableStatements = [
        ...shuffledLibrary.slice(0, libraryCount),
        ...shuffledCustom.slice(0, customCount)
      ];
      break;
    case 'curated':
      availableStatements = await getCuratedSet(curatedSetId, lang);
      break;
  }
  
  return availableStatements.sort(() => Math.random() - 0.5).slice(0, 25);
};
```

**Components to Create:**
- `/src/components/StatementSourceSelector.jsx` - Selection interface
- `/src/components/StatementPreview.jsx` - Preview modal
- Update `/src/views/AdminDashboard.jsx` - Add statement source to game creation

**Validation:**
```javascript
// Before allowing "Custom Only" or "Mixed"
const validateCustomStatements = async (adminId, language) => {
  const custom = await getCustomStatements(adminId, language);
  if (custom.length < 25) {
    return {
      valid: false,
      error: `You need at least 25 custom statements. You have ${custom.length}.`
    };
  }
  return { valid: true };
};
```

#### Success Criteria
- Admin can select statement source during game creation
- Preview shows accurate sample of selected statements
- Mixed mode respects chosen ratio
- Custom-only validates admin has enough statements
- Game stores statement snapshot (doesn't break if admin deletes statements later)

---

## Implementation Phases

### Phase 1: Custom Statements (v1.1)
**Timeline:** 2-3 weeks  
**Dependencies:** None

1. Week 1: Database schema + CRUD operations
2. Week 2: Admin UI for statement management
3. Week 3: Testing + refinement

**Deliverables:**
- Custom statement creation interface
- Persistent storage in Firestore
- Statement validation and limits

---

### Phase 2: Statement Selection (v1.1)
**Timeline:** 1 week  
**Dependencies:** Feature 1

1. Update game creation flow
2. Add statement source selector
3. Preview functionality
4. Update board generation logic

**Deliverables:**
- Source selection dropdown
- Preview modal
- Mixed ratio slider
- Validation for custom statements

---

### Phase 3: Database Migration (v1.2)
**Timeline:** 3-4 weeks  
**Dependencies:** Features 1 & 3 stable

1. Week 1: Migrate statements to Firestore
2. Week 2: Migrate translations to Firestore
3. Week 3: Caching layer implementation
4. Week 4: Admin interface for library management (super-admin only)

**Deliverables:**
- All content in database
- Caching for performance
- Multi-language framework
- Content management interface

---

## Curated Statement Sets (v1.3+)

### Professional Set
Target: Corporate events, professional networking
- "Has given a presentation to 50+ people"
- "Manages a team of 5+ people"
- "Has worked remotely for 2+ years"
- "Has changed careers"
- "Speaks the same programming language as you"

### Casual/Social Set  
Target: Social gatherings, informal meetups
- "Is a morning person"
- "Loves pizza"
- "Can ride a bike with no hands"
- "Has the same favorite movie as you"
- "Loves to sleep in"

### Technical/Developer Set
Target: Tech conferences, developer meetups
- "Contributes to open source"
- "Has attended a hackathon"
- "Uses Vim/Emacs daily"
- "Has deployed on a Friday"
- "Knows what a heisenbug is"

### Family-Friendly Set
Target: Family events, kids included
- "Has built a snowman this year"
- "Loves ice cream"
- "Can do a cartwheel"
- "Likes building with Lego"
- "Has been to an amusement park"

---

## Technical Debt & Improvements

### Code Quality
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
- [ ] Dark mode support
- [ ] Mobile app (React Native)

### Admin Features
- [ ] Game templates (save configuration as template)
- [ ] Duplicate existing game
- [ ] Bulk game creation
- [ ] Player analytics (engagement metrics)
- [ ] Custom branding (logo, colors per game)
- [ ] Scheduled games (set start/end times)

### Player Features
- [ ] Player profiles (optional, track stats across games)
- [ ] Achievement badges
- [ ] Leaderboard across multiple games
- [ ] Social sharing (share BINGO on social media)
- [ ] Hints system (suggest people to talk to)

### Social & Collaboration
- [ ] Team tournaments (multiple games, aggregate scores)
- [ ] Public game discovery (opt-in public games)
- [ ] Share statement libraries between admins
- [ ] Community voting on best statements
- [ ] Integration with Slack/Teams for notifications

---

## Version History

### v1.0 (Current) - January 2025
- Initial release
- Core gameplay functionality
- Admin and player flows
- Real-time synchronization
- Bilingual support (EN/NO)

### v1.1 (Planned) - Q1 2025
- Custom statements by admin
- Statement set selection
- Enhanced admin dashboard
- Improved mobile experience

### v1.2 (Planned) - Q2 2025
- Database-backed content
- Multi-language framework (3+ languages)
- Performance optimizations
- TypeScript migration

### v1.3 (Planned) - Q3 2025
- Curated statement sets
- Analytics dashboard
- QR code support
- Export functionality

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
*Maintained by: EC Engineering Team*