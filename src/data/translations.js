/**
 * Translations for Icebreaker Bingo
 * 
 * Contains all UI text in English and Norwegian.
 * Add new languages by adding a new key to the translations object.
 */

export const translations = {
  en: {
    appTitle: "Icebreaker Bingo",
    tagline: "Break the ice, build connections",
    adminLogin: "Admin Login",
    participate: "Join as Player",
    email: "Email",
    password: "Password",
    login: "Login",
    loginError: "Invalid credentials",
    logout: "Logout",
    backToHome: "Back to Home",
    myGames: "My Games",
    createNewGame: "Create New Game",
    noGames: "No games yet. Create your first game!",
    gameName: "Game Name",
    create: "Create",
    gameCode: "Game Code",
    copyLink: "Copy Link",
    copied: "Copied!",
    viewGame: "View Game",
    deleteGame: "Delete",
    confirmDelete: "Are you sure you want to delete this game?",
    registeredPlayers: "Registered Players",
    noPlayers: "No players yet",
    hasBingo: "HAS BINGO!",
    filled: "Filled",
    enterGameCode: "Enter Game Code",
    yourName: "Your Name",
    join: "Join",
    invalidCode: "Invalid game code",
    nameRequired: "Please enter your name",
    newBoard: "New Board",
    backToMenu: "Leave Game",
    subtitle: "Find people who match these descriptions!",
    winMessage: "BINGO! You won!",
    instructions: "Type names in squares when you find matching people. Get 5 in a row to win!",
    loading: "Loading...",
    playingAs: "Playing as",
    endGame: "End Game",
    confirmEndGame: "Are you sure you want to end this game? Players can no longer join, but data will be preserved.",
    active: "Active",
    ended: "Ended",
    adminCannotPlay: "Admin Cannot Join as Player",
    adminPlayMessage: "You are currently logged in as an administrator. To join a game as a player, please:",
    adminPlayStep1: "1. Log out from your admin account, or",
    adminPlayStep2: "2. Open this page in a private/incognito window",
    confirmLeaveGame: "Are you sure you want to leave this game? Your progress will be lost.",
    duplicateWarning: "is already used in another square!",
    refresh: "Refresh",
    sortBy: "Sort by:",
    progress: "Progress",
    name: "Name",
    ascending: "↑ Low to High",
    descending: "↓ High to Low",
    duplicateNameHint: "The field will be cleared when you click away.",


     // Player Join - Game Info
    gameLanguage: "Game language",
    status: "Status",
    gameHasEnded: "This game has ended",
    loadingGameInfo: "Loading game info...",
    gameCodeDetected: "Game code detected",


    // Game Status
    pending: "Pending",
    active: "Active", 
    ended: "Ended",
    
    // Waiting Room
    waitingRoomTitle: "Get Ready!",
    waitingRoomSubtitle: "Waiting for game to start",
    waitingRoomInstructions: "The admin will start the game soon. Stay on this page!",
    waitingRoomFooter: "You can see your bingo board, but you can't fill it yet.",
    playersWaiting: "Players waiting",
    
    // Waiting Steps
    waitingStep1: "The admin is reviewing who has joined",
    waitingStep2: "When everyone is ready, the admin will click 'Start Game'",
    waitingStep3: "Your board will unlock and you can start playing!",
    
    // Admin Actions
    startGame: "Start Game",
    startGameConfirm: "Start the game now? All players will be able to begin filling their boards.",
    gameStarted: "Game Started! Players can now fill their boards.",
    
    // Player Notifications
    gameHasStarted: "🎉 Game Started! You can now fill in names.",
    gameNotStarted: "Game hasn't started yet. Please wait...",

    // Admin Game View - Player Count Info
    player: "Player",
    players: "Players",
    language: "Language",
    
    // Admin Game View - Validation Messages
    startGameFewPlayersWarning: "Warning: Only {count} player(s) have joined. The game will be very difficult to complete with so few players. Do you want to start anyway?",
    
    // Admin Game View - Status Banners
    noPlayersYet: "No players yet",
    shareGameCode: "Share the game code with participants. They need to join before you can start the game.",
    fewPlayers: "Few players",
    fewPlayersMessage: "With only {count} player(s), completing the bingo will be very difficult. Consider waiting for more players to join.",
    readyToStart: "Ready to start!",
    readyToStartMessage: "{count} players are waiting. Click \"Start Game\" when everyone is ready.",
    cannotStartNoPlayers: "Cannot start game: No players have joined yet. Share the game code and wait for players to join.",
    shareCodeToStart: "Share the game code with participants to get started",

// Grid Size Selection
    selectGridSize: "Select Grid Size",
    grid3x3: "3×3 (9 squares)",
    grid3x3Desc: "Quick games, mobile-friendly",
    grid4x4: "4×4 (16 squares)",
    grid4x4Desc: "Balanced, works everywhere",
    grid5x5: "5×5 (25 squares)",
    grid5x5Desc: "Classic BINGO, best on desktop",
    grid5x5Warning: "Mobile players may find this grid difficult to use. Consider 4×4 for groups with mobile users.",
    recommended: "Recommended",
    gridSize: "Grid Size",
    
    // Win Conditions
    winCondition: "Win Condition",
    line: "line",
    lines: "lines",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    veryHard: "Very Hard",
    blackout: "Full Board (Blackout)",
    fullBoard: "Full Board",
    squares: "squares",
    blackoutDesc: "Fill all squares on the board",
    oneLineDesc: "Complete any single row, column, or diagonal",
    multipleLinesDesc: "Complete {count} different rows, columns, or diagonals",
    
    // Game Preview
    gamePreview: "Game Preview",
    totalSquares: "Total squares",
    toWin: "To win",
    fillAllSquares: "Fill all squares",
    estimatedTime: "Est. time",
    howToWin: "How to win",
    
    gameConfiguration: "Game Configuration",
    progress: "Progress",
    needToWin: "Need",
    allSquares: "All squares",
    grid5x5MobileWarning: "This 5×5 grid works best on desktop or tablet",
    squaresFilled: "Squares",
    linesCompleted: "Lines",
    goalReached: "Goal reached!",

    // Player Info
    gridInfo: "Grid",
    winRequirement: "Win"
  },
  no: {
    appTitle: "Icebreaker Bingo",
    tagline: "Bryt isen, bygg relasjoner",
    adminLogin: "Admin Innlogging",
    participate: "Delta som Spiller",
    email: "E-post",
    password: "Passord",
    login: "Logg Inn",
    loginError: "Ugyldig pålogging",
    logout: "Logg Ut",
    backToHome: "Tilbake til Hjem",
    myGames: "Mine Spill",
    createNewGame: "Opprett Nytt Spill",
    noGames: "Ingen spill ennå. Opprett ditt første spill!",
    gameName: "Spillnavn",
    create: "Opprett",
    gameCode: "Spillkode",
    copyLink: "Kopier Lenke",
    copied: "Kopiert!",
    viewGame: "Se Spill",
    deleteGame: "Slett",
    confirmDelete: "Er du sikker på at du vil slette dette spillet?",
    registeredPlayers: "Registrerte Spillere",
    noPlayers: "Ingen spillere ennå",
    hasBingo: "HAR BINGO!",
    filled: "Fylt",
    enterGameCode: "Skriv Inn Spillkode",
    yourName: "Ditt Navn",
    join: "Bli Med",
    invalidCode: "Ugyldig spillkode",
    nameRequired: "Vennligst skriv inn navnet ditt",
    newBoard: "Nytt Brett",
    backToMenu: "Forlat Spill",
    subtitle: "Finn personer som passer til disse beskrivelsene!",
    winMessage: "BINGO! Du vant!",
    instructions: "Skriv inn navn i ruter når du finner personer som passer. Få 5 på rad for å vinne!",
    loading: "Laster...",
    playingAs: "Spiller som",
    endGame: "Avslutt Spill",
    confirmEndGame: "Er du sikker på at du vil avslutte dette spillet? Spillere kan ikke lenger bli med, men data blir bevart.",
    active: "Aktivt",
    ended: "Avsluttet",
    adminCannotPlay: "Admin Kan Ikke Delta Som Spiller",
    adminPlayMessage: "Du er for øyeblikket innlogget som administrator. For å delta i et spill som spiller, vennligst:",
    adminPlayStep1: "1. Logg ut fra administratorkontoen din, eller",
    adminPlayStep2: "2. Åpne denne siden i et privat/inkognito vindu",
    confirmLeaveGame: "Er du sikker på at du vil forlate dette spillet? Fremgangen din vil gå tapt.",
    duplicateWarning: "er allerede brukt i en annen rute!",
    refresh: "Oppdater",
    sortBy: "Sorter etter:",
    progress: "Fremgang",
    name: "Navn",
    ascending: "↑ Lav til Høy",
    descending: "↓ Høy til Lav",
    duplicateNameHint: "Feltet blir tømt når du klikker utenfor.",

    // Player Join - Game Info
    gameLanguage: "Spillspråk",
    status: "Status",
    gameHasEnded: "Dette spillet er avsluttet",
    loadingGameInfo: "Laster spillinfo...",
    gameCodeDetected: "Spillkode oppdaget",


    // Game Status
    pending: "Venter",
    active: "Aktiv",
    ended: "Avsluttet",
    
    // Waiting Room
    waitingRoomTitle: "Gjør deg klar!",
    waitingRoomSubtitle: "Venter på at spillet starter",
    waitingRoomInstructions: "Administratoren vil starte spillet snart. Bli på denne siden!",
    waitingRoomFooter: "Du kan se bingobrettet ditt, men du kan ikke fylle det ennå.",
    playersWaiting: "Spillere som venter",
    
    // Waiting Steps
    waitingStep1: "Administratoren ser over hvem som har blitt med",
    waitingStep2: "Når alle er klare, vil administratoren klikke 'Start spill'",
    waitingStep3: "Brettet ditt låses opp og du kan begynne å spille!",
    
    // Admin Actions
    startGame: "Start spill",
    startGameConfirm: "Start spillet nå? Alle spillere vil kunne begynne å fylle brettene sine.",
    gameStarted: "Spillet startet! Spillere kan nå fylle brettene sine.",
    
    // Player Notifications
    gameHasStarted: "🎉 Spillet startet! Du kan nå fylle inn navn.",
    gameNotStarted: "Spillet har ikke startet ennå. Vennligst vent...",

    // Admin Game View - Player Count Info
    player: "Spiller",
    players: "Spillere",
    language: "Språk",
    
    // Admin Game View - Validation Messages
    cannotStartNoPlayers: "Kan ikke starte spillet: Ingen spillere har blitt med ennå. Del spillkoden og vent på at spillere blir med.",
    startGameFewPlayersWarning: "Advarsel: Bare {count} spiller(e) har blitt med. Spillet vil være veldig vanskelig å fullføre med så få spillere. Vil du starte likevel?",
    
    // Admin Game View - Status Banners
    noPlayersYet: "Ingen spillere ennå",
    shareGameCode: "Del spillkoden med deltakerne. De må bli med før du kan starte spillet.",
    fewPlayers: "Få spillere",
    fewPlayersMessage: "Med bare {count} spiller(e) vil det være veldig vanskelig å fullføre bingoen. Vurder å vente på flere spillere.",
    readyToStart: "Klar til å starte!",
    readyToStartMessage: "{count} spillere venter. Klikk \"Start spill\" når alle er klare.",
    cannotStartNoPlayers: "Kan ikke starte spillet: Ingen spillere har blitt med ennå. Del spillkoden og vent på at spillere blir med.",
    shareCodeToStart: "Del spillkoden med deltakerne for å komme i gang",

    // Grid Size Selection
    selectGridSize: "Velg rutenettstørrelse",
    grid3x3: "3×3 (9 ruter)",
    grid3x3Desc: "Raske spill, mobilv vennlig",
    grid4x4: "4×4 (16 ruter)",
    grid4x4Desc: "Balansert, fungerer overalt",
    grid5x5: "5×5 (25 ruter)",
    grid5x5Desc: "Klassisk BINGO, best på datamaskin",
    grid5x5Warning: "Mobilspillere kan finne dette rutenettet vanskelig å bruke. Vurder 4×4 for grupper med mobilbrukere.",
    recommended: "Anbefalt",
    gridSize: "Rutenettstørrelse",
    
    // Win Conditions
    winCondition: "Vinnerbetingelse",
    line: "linje",
    lines: "linjer",
    easy: "Lett",
    medium: "Middels",
    hard: "Vanskelig",
    veryHard: "Veldig vanskelig",
    blackout: "Helt brett (Blackout)",
    fullBoard: "Helt brett",
    squares: "ruter",
    blackoutDesc: "Fyll alle rutene på brettet",
    oneLineDesc: "Fullfør en enkelt rad, kolonne eller diagonal",
    multipleLinesDesc: "Fullfør {count} forskjellige rader, kolonner eller diagonaler",
    
    // Game Preview
    gamePreview: "Spillforhåndsvisning",
    totalSquares: "Totalt antall ruter",
    toWin: "For å vinne",
    fillAllSquares: "Fyll alle ruter",
    estimatedTime: "Est. tid",
    howToWin: "Hvordan vinne",

    gameConfiguration: "Spillkonfigurasjon",
    progress: "Fremdrift",
    needToWin: "Trenger",
    allSquares: "Alle ruter",
    grid5x5MobileWarning: "Dette 5×5 rutenettet fungerer best på datamaskin eller nettbrett",
    squaresFilled: "Ruter",
    linesCompleted: "Linjer",
    goalReached: "Mål nådd!",
    
    // Player Info
    gridInfo: "Rutenett",
    winRequirement: "Vinn"
  }
};
