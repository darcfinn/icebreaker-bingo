import React, { useState, useEffect } from 'react';
import { Shuffle, Globe, Users, Copy, Check, Trophy, User, LogIn, LogOut, Lock } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import * as authService from './services/authService';
import * as gameService from './services/gameService';
import { useAuth } from './hooks/useAuth';
import { useGame } from './hooks/useGame';
import { usePlayer } from './hooks/usePlayer';

/**
 * ICEBREAKER BINGO APPLICATION
 * 
 * This application allows admins to create and manage icebreaker bingo games,
 * while players can join games anonymously using a game code.
 * 
 * Key Features:
 * - Admin authentication with email/password
 * - Anonymous player access via game codes
 * - Real-time synchronization across devices
 * - Direct game URLs for easy sharing
 * - Multi-language support (English/Norwegian)
 */

const IcebreakerBingo = () => {
  // ===========================================
  // INITIAL URL PARAMETER CHECK
  // ===========================================
  // Check if there's a game code in the URL (e.g., ?game=ABC123)
  // This must happen before state initialization to properly set the initial view
  const urlParams = new URLSearchParams(window.location.search);
  const gameCodeFromUrl = urlParams.get('game');
  const playerIdFromUrl = urlParams.get('player');
  
  // If both game and player are in URL, this is a returning player
  // Start with playerGame view and let the effect restore the session
  const initialView = (gameCodeFromUrl && playerIdFromUrl) ? 'playerGame' : 
                      gameCodeFromUrl ? 'playerJoin' : 
                      'landing';
  
  // ===========================================
  // STATE MANAGEMENT
  // ===========================================
  
  // View state: Controls which screen/page is currently displayed
  // Options: 'landing', 'adminLogin', 'adminDashboard', 'adminGameView', 'playerJoin', 'playerGame'
  const [view, setView] = useState(initialView);
  
  // Language: 'en' (English) or 'no' (Norwegian)
  const [language, setLanguage] = useState('en');
  
  
  
  // Use custom hooks
  const auth = useAuth();
  const game = useGame(auth.currentUser, auth.isAdmin);
  const player = usePlayer();

  // UI-specific state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
   
  // Admin Game Management
  const [playerSortBy, setPlayerSortBy] = useState('progress'); // 'progress' or 'name'
  const [playerSortOrder, setPlayerSortOrder] = useState('desc'); // 'asc' or 'desc'
  
  // UI State
  const [copied, setCopied] = useState(false); // Shows "Copied!" feedback
  const [loading, setLoading] = useState(false); // Loading indicator
  const [error, setError] = useState(''); // Error message display
  const [prefilledGameCode, setPrefilledGameCode] = useState(gameCodeFromUrl ? gameCodeFromUrl.toUpperCase() : null); // Game code from URL

  // ===========================================
  // BINGO STATEMENTS DATABASE
  // ===========================================
  // 90 statements in each language for variety
  // Each player gets a random selection of 25 statements
  const statements = {
    en: [
      "Has traveled to 5+ countries",
      "Speaks 3+ languages",
      "Has run a marathon",
      "Is a morning person",
      "Has met a celebrity",
      "Plays a musical instrument",
      "Has been skydiving",
      "Is left-handed",
      "Has a pet other than cat/dog",
      "Was born in the same month as you",
      "Has worked in 3+ countries",
      "Enjoys cooking",
      "Has been on TV",
      "Can do a handstand",
      "Has lived in 5+ cities",
      "Loves spicy food",
      "Has a hidden talent",
      "Enjoys hiking",
      "Has never broken a bone",
      "Is an only child",
      "Has written a book or blog",
      "Loves winter sports",
      "Can solve a Rubik's cube",
      "Has volunteered abroad",
      "Enjoys reading sci-fi",
      "Has the same hobby as you",
      "Is afraid of heights",
      "Drinks coffee every day",
      "Has been to Antarctica",
      "Loves karaoke",
      "Has the same favorite color",
      "Enjoys gardening",
      "Has run their own business",
      "Loves sushi",
      "Has attended a music festival",
      "Can speak backwards",
      "Has gone camping this year",
      "Prefers tea over coffee",
      "Has a collection hobby",
      "Loves board games",
      "Has baked at home",
      "Can ride a bike with no hands",
      "Has seen the northern lights",
      "Loves pizza",
      "Can whistle a tune",
      "Has been to the cabin this summer",
      "Likes to draw or paint",
      "Has the same favorite movie as you",
      "Can do a cartwheel",
      "Has picked berries in the forest",
      "Loves to swim",
      "Has built a snowman this year",
      "Likes to play video games",
      "Has been on a cruise",
      "Loves ice cream",
      "Has the same number of siblings as you",
      "Likes to dance",
      "Has been to an amusement park",
      "Can play cards",
      "Has gone camping",
      "Loves to sleep in",
      "Has been to a football match",
      "Likes building with Lego",
      "Can sew a button",
      "Has been skiing this year",
      "Loves chocolate",
      "Has visited a museum",
      "Likes to sing",
      "Has fished in the sea or river",
      "Loves pancakes",
      "Has the same lucky number as you",
      "Likes to run",
      "Has traveled abroad this year",
      "Can play chess",
      "Has planted something in the garden",
      "Loves Taco Friday",
      "Has been to a concert",
      "Likes to read comics",
      "Has the same shoe size as you",
      "Can make a paper airplane",
      "Has been to Bergen",
      "Loves popcorn",
      "Has gone hiking",
      "Likes home improvement",
      "Has the same favorite season as you",
      "Can ride a scooter",
      "Has been to the cinema this year",
      "Loves waffles"
    ],
    no: [
      "Har reist til 5+ land",
      "Snakker 3+ språk",
      "Har løpt maraton",
      "Er morgenmenneske",
      "Har møtt en kjendis",
      "Spiller et musikkinstrument",
      "Har prøvd fallskjermhopping",
      "Er venstrehendt",
      "Har et kjæledyr utenom katt/hund",
      "Er født i samme måned som deg",
      "Har jobbet i 3+ land",
      "Liker å lage mat",
      "Har vært på TV",
      "Kan stå på hendene",
      "Har bodd i 5+ byer",
      "Elsker sterk mat",
      "Har et skjult talent",
      "Liker fjelltur",
      "Har aldri brukket et bein",
      "Er enebarn",
      "Har skrevet bok eller blogg",
      "Elsker vintersport",
      "Kan løse Rubiks kube",
      "Har vært frivillig i utlandet",
      "Liker å lese sci-fi",
      "Har samme hobby som deg",
      "Er redd for høyder",
      "Drikker kaffe hver dag",
      "Har vært på Antarktis",
      "Elsker karaoke",
      "Har samme favorittfarge",
      "Liker hagearbeid",
      "Har drevet egen bedrift",
      "Elsker sushi",
      "Har vært på musikkfestival",
      "Kan snakke baklengs",
      "Har vært på camping i år",
      "Foretrekker te fremfor kaffe",
      "Har en samlerinteresse",
      "Elsker brettspill",
      "Har bakt boller hjemme",
      "Kan sykle uten hender",
      "Har sett nordlyset",
      "Elsker pizza",
      "Kan fløyte en melodi",
      "Har vært på hytta i sommer",
      "Liker å tegne eller male",
      "Har samme yndlingsfilm som deg",
      "Kan hoppe bukk",
      "Har plukket bær i skogen",
      "Elsker å svømme",
      "Har bygget snømann i år",
      "Liker å spille videospill",
      "Kan gjøre hjulet",
      "Har vært på cruise",
      "Elsker is",
      "Har samme antall søsken som deg",
      "Liker å danse",
      "Har vært på Tusenfryd",
      "Kan spille kort",
      "Har dratt på campingtur",
      "Elsker å sove lenge",
      "Har vært på fotballkamp",
      "Liker å lage Lego",
      "Har samme yndlingsfarge som deg",
      "Kan sy på knapp",
      "Har gått på ski i år",
      "Elsker sjokolade",
      "Har vært på museum",
      "Liker å synge",
      "Har fisket i sjøen eller elv",
      "Elsker pannekaker",
      "Har samme yndlingstall som deg",
      "Liker å løpe",
      "Har vært i utlandet i år",
      "Kan spille sjakk",
      "Har plantet noe i hagen",
      "Elsker fredagstaco",
      "Har vært på konsert",
      "Liker å lese tegneserier",
      "Har samme skostørrelse som deg",
      "Kan lage papirfly",
      "Har vært i Bergen",
      "Elsker popcorn",
      "Har gått en tur i marka",
      "Liker å pusse opp",
      "Har samme favorittårstid som deg",
      "Kan stå på sparkesykkel",
      "Har vært på kino i år",
      "Elsker vafler"
    ]
  };

  // ===========================================
  // TRANSLATIONS
  // ===========================================
  // All UI text in both English and Norwegian
  const translations = {
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
      copyLink: "Copy Game Link",
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
      gameEnded: "Game Ended",
      confirmEndGame: "Are you sure you want to end this game? Players can no longer join, but data will be preserved.",
      active: "Active",
      ended: "Ended",
      adminCannotPlay: "Admin Cannot Join as Player",
      adminPlayMessage: "You are currently logged in as an administrator. To join a game as a player, please:",
      adminPlayStep1: "1. Log out from your admin account, or",
      adminPlayStep2: "2. Open this page in a private/incognito window",
      confirmLeaveGame: "Are you sure you want to leave this game? Your progress will be lost.",
      refresh: "Refresh",
      sortBy: "Sort by:",
      progress: "Progress",
      name: "Name",
      ascending: "Ascending",
      descending: "Descending"
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
      copyLink: "Kopier Spilllenke",
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
      gameEnded: "Spill Avsluttet",
      confirmEndGame: "Er du sikker på at du vil avslutte dette spillet? Spillere kan ikke lenger bli med, men data blir bevart.",
      active: "Aktivt",
      ended: "Avsluttet",
      adminCannotPlay: "Admin Kan Ikke Delta Som Spiller",
      adminPlayMessage: "Du er for øyeblikket innlogget som administrator. For å delta i et spill som spiller, vennligst:",
      adminPlayStep1: "1. Logg ut fra administratorkontoen din, eller",
      adminPlayStep2: "2. Åpne denne siden i et privat/inkognito vindu",
      confirmLeaveGame: "Er du sikker på at du vil forlate dette spillet? Fremgangen din vil gå tapt.",
      refresh: "Oppdater",
      sortBy: "Sorter etter:",
      progress: "Fremgang",
      name: "Navn",
      ascending: "Stigende",
      descending: "Synkende"
    }
  };

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('✅ User authenticated:', user.email || user.uid);
        setCurrentUser(user);
        
        // Check if this is an admin (has email) or anonymous player
        if (user.email) {
          setIsAdmin(true);
          if (view === 'adminLogin') {
            setView('adminDashboard');
          }
          // Load admin's games
          await loadMyGames(user.uid);
        }
      } else {
        console.log('No user authenticated');
        setCurrentUser(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ===========================================
  // EFFECT: REAL-TIME GAME DATA SUBSCRIPTION
  // ===========================================
  // Subscribes to Firestore updates for the current game
  // Updates player board and progress in real-time
  useEffect(() => {
    if (!currentGameId) return;

    console.log('👀 Subscribing to game:', currentGameId);

    const unsubscribe = onSnapshot(
      doc(db, 'games', currentGameId),
      (docSnap) => {
        if (docSnap.exists()) {
          const gameData = docSnap.data();
          setCurrentGame(gameData);
          
          // If player view, load their board
          if (playerId && gameData.players && gameData.players[playerId]) {
            const player = gameData.players[playerId];
            setPlayerBoard(player.board || []);
            setPlayerNames(player.names || {});
          }
        } else {
          console.error('❌ Game not found');
          setError('Game not found');
        }
      },
      (error) => {
        console.error('❌ Error listening to game:', error);
      }
    );

    return () => unsubscribe();
  }, [currentGameId, playerId]);

  // ===========================================
  // HELPER FUNCTIONS
  // ===========================================
  
  /**
   * Loads all games created by the specified admin
   * @param {string} adminId - Firebase UID of the admin
   */
	const loadMyGames = async (adminId) => {
	  try {
	    const games = await gameService.loadAdminGames(adminId);
	    setMyGames(games);
	  } catch (err) {
	    console.error('❌ Error loading games:', err);
	  }
	};

  // ===========================================
  // AUTHENTICATION FUNCTIONS
  // ===========================================
  
  /**
   * Handles admin login with email and password
   * On success, Firebase auth state change triggers navigation to dashboard
   */
	const handleAdminLogin = async () => {
	  setLoading(true);
	  setError('');
	
	  try {
	    const userCredential = await authService.loginAdmin(adminEmail, adminPassword);
	    setAdminEmail('');
	    setAdminPassword('');
	    setIsAdmin(true);
	    setView('adminDashboard');
	    const games = await gameService.loadAdminGames(userCredential.user.uid);
	    setMyGames(games);
	  } catch (err) {
	    if (err.code === 'auth/user-not-found') setError('No account found');
	    else if (err.code === 'auth/wrong-password') setError('Incorrect password');
	    else setError('Login failed');
	  } finally {
	    setLoading(false);
	  }
	};
 

  /**
   * Logs out the admin and returns to landing page
   * Clears all admin-related state
   */
  const handleAdminLogout = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      setMyGames([]);
      setCurrentGameId(null);
      setCurrentGame(null);
      setView('landing');
      console.log('✅ Admin logged out');
    } catch (err) {
      console.error('❌ Logout error:', err);
    }
  };

  // ===========================================
  // GAME MANAGEMENT FUNCTIONS
  // ===========================================
  
  /**
   * Generates a random 6-character game code
   * @returns {string} Uppercase alphanumeric code (e.g., "ABC123")
   */
  const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  /**
   * Generates a random 5x5 bingo board from statements
   * @param {string} lang - Language code ('en' or 'no')
   * @returns {Array} Array of 25 random statements
   */
  const generateBoard = (lang) => {
    const shuffled = [...statements[lang]].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 25);
  };

  /**
   * Creates a new game in Firestore
   * @param {string} gameName - Display name for the game
   */
	const createGame = async (gameName) => {
	  if (!auth.currentUser || !auth.isAdmin) {
	    setError('Admin access required');
	    return;
	  }
	
	  setLoading(true);
	  setError('');
	
	  try {
	    const gameCode = await gameService.createGame({
	      name: gameName,
	      language: language,
	      adminId: auth.currentUser.uid,
	      adminEmail: auth.currentUser.email,
	      players: {}
	    });
	    
	    console.log('✅ Game created:', gameCode);
	    const games = await gameService.loadAdminGames(auth.currentUser.uid);
	    setMyGames(games);
	  } catch (err) {
	    console.error('❌ Error creating game:', err);
	    setError('Failed to create game: ' + err.message);
	  } finally {
	    setLoading(false);
	  }
	};

  /**
   * Navigates to the game view for admins
   * Loads initial game data before switching view
   * @param {string} gameId - Game code to view
   */
	const viewGame = async (gameId) => {
	  console.log('🎮 Opening game view:', gameId);
	  try {
	    const gameData = await gameService.getGame(gameId);
	    
	    if (gameData) {
	      setCurrentGame(gameData);
	      setCurrentGameId(gameId);
	      setView('adminGameView');
	      console.log('✅ Game loaded');
	    } else {
	      console.error('❌ Game not found');
	      setError('Game not found');
	    }
	  } catch (err) {
	    console.error('❌ Error loading game:', err);
	    setError('Failed to load game');
	  }
	};

  /**
   * Ends a game (closes it to new players but preserves data)
   * @param {string} gameId - Game code to end
   */
	const endGame = async (gameId) => {
	  if (!window.confirm(translations[language].confirmEndGame)) {
	    return;
	  }
	
	  try {
	    await gameService.endGame(gameId);
	    const games = await gameService.loadAdminGames(auth.currentUser.uid);
	    setMyGames(games);
	  } catch (err) {
	    console.error('❌ Error ending game:', err);
	    setError('Failed to end game');
	  }
	};

  /**
   * Permanently deletes a game and all its data
   * @param {string} gameId - Game code to delete
   */
	const deleteGame = async (gameId) => {
	  if (!window.confirm(translations[language].confirmDelete)) {
	    return;
	  }
	
	  try {
	    await gameService.deleteGame(gameId);
	    const games = await gameService.loadAdminGames(auth.currentUser.uid);
	    setMyGames(games);
	  } catch (err) {
	    console.error('❌ Error deleting game:', err);
	    setError('Failed to delete game');
	  }
	};

  /**
   * Allows a player to join a game anonymously
   * Creates a unique player entry with a randomized board
   * @param {string} gameCode - Game code to join
   * @param {string} name - Player's display name
   */
  const joinGameAsPlayer = async (gameCode, name) => {
    setLoading(true);
    setError('');

    try {
      // Sign in anonymously for players
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      console.log('🔍 Looking for game:', gameCode);
      const gameRef = doc(db, 'games', gameCode);
      const gameSnap = await getDoc(gameRef);

      if (!gameSnap.exists()) {
        setError(translations[language].invalidCode);
        setLoading(false);
        return;
      }

      const game = gameSnap.data();

      // Check if game has ended
      if (game.status === 'ended') {
        setError(language === 'en' ? 'This game has ended and is no longer accepting players.' : 'Dette spillet er avsluttet og tar ikke lenger imot spillere.');
        setLoading(false);
        return;
      }

      if (!name.trim()) {
        setError(translations[language].nameRequired);
        setLoading(false);
        return;
      }

      const newPlayerId = Date.now().toString();
      const board = generateBoard(game.language);

      const newPlayer = {
        id: newPlayerId,
        name: name.trim(),
        board: board,
        names: {},
        joinedAt: new Date().toISOString()
      };

      console.log('👤 Joining game as:', name.trim());

      await updateDoc(gameRef, {
        [`players.${newPlayerId}`]: newPlayer
      });

      console.log('✅ Joined game successfully');

      setCurrentGameId(gameCode);
      setPlayerName(name.trim());
      setPlayerId(newPlayerId);
      setPlayerBoard(board);
      setPlayerNames({});
      setLanguage(game.language);
      setView('playerGame');
      
      // Save player session to sessionStorage (works in private mode)
      const playerSession = {
        gameId: gameCode,
        playerName: name.trim(),
        playerId: newPlayerId,
        playerBoard: board,
        playerNames: {},
        language: game.language,
        timestamp: new Date().toISOString()
      };
      sessionStorage.setItem('playerSession', JSON.stringify(playerSession));
      console.log('💾 Player session saved to sessionStorage');
      
      // Update URL to include game and player parameters
      window.history.replaceState({}, '', `?game=${gameCode}&player=${newPlayerId}`);
      console.log('🔗 URL updated to include player session');
    } catch (err) {
      console.error('❌ Error joining game:', err);
      setError('Failed to join game: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===========================================
  // PLAYER GAME FUNCTIONS
  // ===========================================
  
  /**
   * Updates player's progress (filled squares) in Firestore
   * Also updates sessionStorage
   * @param {Object} names - Object mapping square index to names {0: "John", 5: "Jane"}
   */
  const updatePlayerProgress = async (names) => {
    if (!currentGameId || !playerId) return;

    try {
      const gameRef = doc(db, 'games', currentGameId);
      await updateDoc(gameRef, {
        [`players.${playerId}.names`]: names
      });
      
      // Update sessionStorage
      const savedSession = sessionStorage.getItem('playerSession');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        session.playerNames = names;
        sessionStorage.setItem('playerSession', JSON.stringify(session));
      }
    } catch (err) {
      console.error('❌ Error updating progress:', err);
    }
  };

  /**
   * Handles input in a bingo square
   * Validates for duplicate names and updates Firestore
   * Only updates Firestore when input loses focus (onBlur)
   * @param {number} index - Square index (0-24)
   * @param {string} name - Name to enter in square
   * @param {boolean} shouldUpdate - Whether to update Firestore (true on blur, false on change)
   */
  const toggleSquare = (index, name, shouldUpdate = false) => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      const newNames = { ...playerNames };
      delete newNames[index];
      setPlayerNames(newNames);
      setDuplicateWarning('');
      if (shouldUpdate) {
        updatePlayerProgress(newNames);
      }
      return;
    }
    
    const existingIndex = Object.entries(playerNames).find(
      ([idx, n]) => n.toLowerCase() === trimmedName.toLowerCase() && parseInt(idx) !== index
    );
    
    if (existingIndex) {
      setDuplicateWarning(language === 'en' 
        ? `Warning: ${trimmedName} is already used in another square!`
        : `Advarsel: ${trimmedName} er allerede brukt i en annen rute!`
      );
      setTimeout(() => setDuplicateWarning(''), 3000);
      return;
    }
    
    const newNames = { ...playerNames, [index]: trimmedName };
    setPlayerNames(newNames);
    setDuplicateWarning('');
    
    // Only update Firestore when shouldUpdate is true (on blur)
    if (shouldUpdate) {
      updatePlayerProgress(newNames);
    }
  };

  /**
   * Checks if a player has achieved bingo (5 in a row)
   * Checks all rows, columns, and diagonals
   * @param {Object} names - Filled squares {index: name}
   * @returns {boolean} True if player has bingo
   */
  const checkWin = (names) => {
    const filled = Object.keys(names).map(k => parseInt(k));
    
    for (let row = 0; row < 5; row++) {
      if ([0, 1, 2, 3, 4].every(col => filled.includes(row * 5 + col))) {
        return true;
      }
    }
    
    for (let col = 0; col < 5; col++) {
      if ([0, 1, 2, 3, 4].every(row => filled.includes(row * 5 + col))) {
        return true;
      }
    }
    
    if ([0, 1, 2, 3, 4].every(i => filled.includes(i * 5 + i))) {
      return true;
    }
    if ([0, 1, 2, 3, 4].every(i => filled.includes(i * 5 + (4 - i)))) {
      return true;
    }
    
    return false;
  };

  // ===========================================
  // UTILITY FUNCTIONS
  // ===========================================
  
  /**
   * Copies the direct game URL to clipboard
   * Format: https://yoursite.com?game=ABC123
   */
  const copyGameLink = () => {
    const link = `${window.location.origin}?game=${currentGameId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Copies a game link for a specific game (used in dashboard list)
   * @param {string} gameId - Game code to create link for
   */
  const copySpecificGameLink = (gameId) => {
    const link = `${window.location.origin}?game=${gameId}`;
    navigator.clipboard.writeText(link);
    // Show temporary feedback
    const temp = document.getElementById(`copy-${gameId}`);
    if (temp) {
      temp.textContent = '✓';
      setTimeout(() => temp.textContent = '', 2000);
    }
  };

  /**
   * Generates a new random board for the current player
   * Clears all filled squares
   */
  const generateNewBoard = async () => {
    if (!currentGame || !playerId || !currentGameId) return;
    
    const newBoard = generateBoard(currentGame.language);
    const newNames = {};
    
    setPlayerBoard(newBoard);
    setPlayerNames(newNames);
    
    try {
      const gameRef = doc(db, 'games', currentGameId);
      await updateDoc(gameRef, {
        [`players.${playerId}.board`]: newBoard,
        [`players.${playerId}.names`]: newNames
      });
    } catch (err) {
      console.error('❌ Error generating new board:', err);
    }
  };

  /**
   * Player leaves the game and returns to join screen
   * Removes player from the game in Firestore
   * Signs out anonymous user and clears session
   */
  const leaveGame = async () => {
    if (!window.confirm(translations[language].confirmLeaveGame)) {
      return;
    }

    try {
      // Remove player from Firestore
      if (currentGameId && playerId) {
        console.log('🗑️ Removing player from game:', playerId);
        const gameRef = doc(db, 'games', currentGameId);
        const gameSnap = await getDoc(gameRef);
        
        if (gameSnap.exists()) {
          const gameData = gameSnap.data();
          const updatedPlayers = { ...gameData.players };
          delete updatedPlayers[playerId];
          
          await updateDoc(gameRef, {
            players: updatedPlayers
          });
          console.log('✅ Player removed from Firestore');
        }
      }
    } catch (err) {
      console.error('❌ Error removing player:', err);
    }

    setView('playerJoin');
    setCurrentGameId(null);
    setCurrentGame(null);
    setPlayerName('');
    setPlayerId(null);
    setPlayerBoard([]);
    setPlayerNames({});
    
    // Clear player session from sessionStorage
    sessionStorage.removeItem('playerSession');
    console.log('🗑️ Player session cleared');
    
    // Clear URL parameters
    window.history.replaceState({}, '', window.location.pathname);
    
    // Sign out anonymous user
    if (auth.currentUser && !auth.currentUser.email) {
      await signOut(auth);
    }
  };

  // Get translations for current language
  const t = translations[language];

  // ===========================================
  // DIAGNOSTIC COMPONENT (Temporary - for debugging)
  // ===========================================
  // TODO: Remove this component after deployment
  const DiagnosticInfo = () => (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs font-mono max-w-sm">
      <div className="font-bold mb-2 text-yellow-300">🔧 Debug Info:</div>
      <div>Current View: <span className="text-green-300">{view}</span></div>
      <div>URL Search: <span className="text-green-300">{window.location.search || '(empty)'}</span></div>
      <div>Game Code from URL: <span className="text-green-300">{prefilledGameCode || '(none)'}</span></div>
      <div>Is Admin: <span className="text-green-300">{auth.isAdmin ? 'Yes' : 'No'}</span></div>
      <div>Current User: <span className="text-green-300">{auth.currentUser ? (auth.currentUser.email || 'Anonymous') : 'None'}</span></div>
      <div>Loading: <span className="text-green-300">{loading ? 'Yes' : 'No'}</span></div>
    </div>
  );

  // ===========================================
  // VIEW: LANDING PAGE
  // ===========================================
  // Main entry point with two options:
  // 1. Admin Login - for game creators
  // 2. Join as Player - for participants
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 flex items-center justify-center">
        <DiagnosticInfo />
        <div className="max-w-4xl w-full">
          {/* User Status Bar */}
          {auth.currentUser && auth.currentUser.email && (
            <div className="mb-6 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 w-3 h-3 rounded-full"></div>
                  <span>Logged in as: <strong>{auth.currentUser.email}</strong></span>
                </div>
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  <span className="font-medium">{t.logout}</span>
                </button>
              </div>
            </div>
          )}

          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-white mb-4">{t.appTitle}</h1>
            <p className="text-2xl text-indigo-100">{t.tagline}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Admin Login Card */}
            <div 
              onClick={() => {
                if (auth.isAdmin) {
                  setView('adminDashboard');
                } else {
                  setView('adminLogin');
                }
              }}
              className="bg-white rounded-2xl shadow-2xl p-8 cursor-pointer transform transition-all hover:scale-105 hover:shadow-3xl"
            >
              <div className="text-center">
                <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {auth.isAdmin ? <User size={40} className="text-indigo-600" /> : <LogIn size={40} className="text-indigo-600" />}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  {auth.isAdmin ? 'Admin Dashboard' : t.adminLogin}
                </h2>
                <p className="text-gray-600">
                  {auth.isAdmin ? 'Manage your games' : 'Create and manage games'}
                </p>
              </div>
            </div>

            {/* Player Join Card */}
            <div 
              onClick={() => setView('playerJoin')}
              className="bg-white rounded-2xl shadow-2xl p-8 cursor-pointer transform transition-all hover:scale-105 hover:shadow-3xl"
            >
              <div className="text-center">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={40} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">{t.participate}</h2>
                <p className="text-gray-600">Join a game with code</p>
              </div>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="text-center mt-8">
            <button
              onClick={() => setLanguage(language === 'en' ? 'no' : 'en')}
              className="flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors mx-auto"
            >
              <Globe size={20} />
              <span className="font-medium">{language === 'en' ? 'Norsk' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================
  // VIEW: ADMIN LOGIN
  // ===========================================
  // Email/password login form for administrators
  if (view === 'adminLogin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <DiagnosticInfo />
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-indigo-600">{t.adminLogin}</h1>
              <button
                onClick={() => setView('landing')}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t.email}</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={loading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && adminEmail && adminPassword) {
                      handleAdminLogin();
                    }
                  }}
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2">{t.password}</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={loading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && adminEmail && adminPassword) {
                      handleAdminLogin();
                    }
                  }}
                />
              </div>

              <button
                onClick={handleAdminLogin}
                disabled={loading}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-400"
              >
                {loading ? t.loading : t.login}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================
  // VIEW: ADMIN DASHBOARD
  // ===========================================
  // Shows all games created by this admin
  // Allows creating new games and managing existing ones
  if (view === 'adminDashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <DiagnosticInfo />
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-indigo-600">{t.myGames}</h1>
                <p className="text-gray-600 mt-1">Welcome, {auth.currentUser?.email}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setLanguage(language === 'en' ? 'no' : 'en')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Globe size={20} />
                  <span className="font-medium">{language === 'en' ? 'NO' : 'EN'}</span>
                </button>
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">{t.logout}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Create New Game */}
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{t.createNewGame}</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder={t.gameName}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                id="newGameName"
                disabled={loading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    createGame(e.target.value.trim());
                    e.target.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById('newGameName');
                  if (input.value.trim()) {
                    createGame(input.value.trim());
                    input.value = '';
                  }
                }}
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-400"
              >
                {loading ? t.loading : t.create}
              </button>
            </div>
          </div>

          {/* Games List */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            {myGames.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t.noGames}</p>
            ) : (
              <div className="space-y-4">
                {myGames.map(game => {
                  // Default to 'active' if status doesn't exist (for older games)
                  const gameStatus = game.status || 'active';
                  
                  return (
                  <div key={game.id} className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{game.name}</h3>
                          {gameStatus === 'ended' && (
                            <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded">
                              {t.ended}
                            </span>
                          )}
                          {gameStatus === 'active' && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                              {t.active}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {t.gameCode}: <span className="font-mono font-bold text-indigo-600">{game.id}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {Object.keys(game.players || {}).length} players
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copySpecificGameLink(game.id)}
                          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                          title={t.copyLink}
                        >
                          <Copy size={16} />
                          <span id={`copy-${game.id}`} className="text-xs"></span>
                        </button>
                        <button
                          onClick={() => viewGame(game.id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          {t.viewGame}
                        </button>
                        {gameStatus === 'active' && (
                          <button
                            onClick={() => endGame(game.id)}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                          >
                            <Lock size={16} />
                            {t.endGame}
                          </button>
                        )}
                        <button
                          onClick={() => deleteGame(game.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          {t.deleteGame}
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===========================================
  // VIEW: ADMIN GAME VIEW
  // ===========================================
  // Detailed view of a specific game
  // Shows all players and their real-time progress
  if (view === 'adminGameView' && currentGame) {
    const players = Object.values(currentGame.players || {});
    
    // Sort players based on current sort settings
    const sortedPlayers = [...players].sort((a, b) => {
      if (playerSortBy === 'progress') {
        const aProgress = Object.keys(a.names || {}).length;
        const bProgress = Object.keys(b.names || {}).length;
        return playerSortOrder === 'desc' ? bProgress - aProgress : aProgress - bProgress;
      } else { // sort by name
        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();
        if (playerSortOrder === 'asc') {
          return aName.localeCompare(bName);
        } else {
          return bName.localeCompare(aName);
        }
      }
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <DiagnosticInfo />
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-indigo-600">{currentGame.name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {t.gameCode}: <span className="font-mono font-bold text-indigo-600">{currentGameId}</span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    console.log('🔄 Manual refresh requested');
                    setLoading(true);
                    try {
                      // Force reload game data
                      const gameRef = doc(db, 'games', currentGameId);
                      const docSnap = await getDoc(gameRef);
                      if (docSnap.exists()) {
                        const gameData = docSnap.data();
                        console.log('✅ Refreshed game data, players:', Object.keys(gameData.players || {}).length);
                        setCurrentGame(gameData);
                      } else {
                        console.error('❌ Game not found');
                      }
                    } catch (err) {
                      console.error('❌ Refresh error:', err);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  title={t.refresh}
                >
                  <Shuffle size={20} />
                  <span className="font-medium">{loading ? t.loading : t.refresh}</span>
                </button>
                <button
                  onClick={copyGameLink}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  <span className="font-medium">{copied ? t.copied : t.copyLink}</span>
                </button>
                <button
                  onClick={() => {
                    setView('adminDashboard');
                    setCurrentGameId(null);
                    setCurrentGame(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {t.backToHome}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Users size={24} />
                {t.registeredPlayers} ({sortedPlayers.length})
              </h2>
              
              {/* Sort Controls */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{t.sortBy}</span>
                
                {/* Sort by selector */}
                <select
                  value={playerSortBy}
                  onChange={(e) => setPlayerSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="progress">{t.progress}</option>
                  <option value="name">{t.name}</option>
                </select>
                
                {/* Sort order selector */}
                <select
                  value={playerSortOrder}
                  onChange={(e) => setPlayerSortOrder(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="desc">{t.descending}</option>
                  <option value="asc">{t.ascending}</option>
                </select>
              </div>
            </div>

            {sortedPlayers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t.noPlayers}</p>
            ) : (
              <div className="space-y-4">
                {sortedPlayers.map(player => {
                  const hasBingo = checkWin(player.names || {});
                  const filledCount = Object.keys(player.names || {}).length;

                  return (
                    <div
                      key={player.id}
                      className={`border-2 rounded-lg p-4 ${
                        hasBingo ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User size={24} className="text-indigo-600" />
                          <div>
                            <h3 className="font-bold text-lg">{player.name}</h3>
                            <p className="text-sm text-gray-600">
                              {t.filled}: {filledCount} / 25
                            </p>
                          </div>
                        </div>
                        {hasBingo && (
                          <div className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
                            <Trophy size={20} />
                            {t.hasBingo}
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(filledCount / 25) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===========================================
  // VIEW: PLAYER JOIN PAGE
  // ===========================================
  // Form for players to enter game code and name
  // Game code may be pre-filled from URL parameter
  // Admins are blocked from joining as players
  if (view === 'playerJoin') {
    // Block admins from joining as players
    if (isAdmin && auth.currentUser?.email) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
          <DiagnosticInfo />
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-orange-600">{t.adminCannotPlay}</h1>
                <button
                  onClick={() => setView('landing')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-gray-700 mb-4">{t.adminPlayMessage}</p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">•</span>
                    <span>{t.adminPlayStep1}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">•</span>
                    <span>{t.adminPlayStep2}</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAdminLogout}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">{t.logout}</span>
                </button>
                <button
                  onClick={() => setView('adminDashboard')}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {t.backToHome}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <DiagnosticInfo />
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-indigo-600">{t.participate}</h1>
              <button
                onClick={() => {
                  setView('landing');
                  setPrefilledGameCode(null);
                  // Clear URL parameter
                  window.history.replaceState({}, '', window.location.pathname);
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {prefilledGameCode && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
                ✓ Game code detected: <strong>{prefilledGameCode}</strong>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">{t.enterGameCode}</label>
                <input
                  type="text"
                  placeholder="ABC123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  id="playerGameCode"
                  disabled={loading}
                  defaultValue={prefilledGameCode || ''}
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">{t.yourName}</label>
                <input
                  type="text"
                  placeholder={t.yourName}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  id="playerNameInput"
                  disabled={loading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const code = document.getElementById('playerGameCode').value.trim().toUpperCase();
                      const name = e.target.value.trim();
                      if (code && name) {
                        joinGameAsPlayer(code, name);
                      }
                    }
                  }}
                />
              </div>

              <button
                onClick={() => {
                  const code = document.getElementById('playerGameCode').value.trim().toUpperCase();
                  const name = document.getElementById('playerNameInput').value.trim();
                  if (code && name) {
                    joinGameAsPlayer(code, name);
                  }
                }}
                disabled={loading}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400"
              >
                {loading ? t.loading : t.join}
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setLanguage(language === 'en' ? 'no' : 'en')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors mx-auto"
              >
                <Globe size={20} />
                <span className="font-medium">{language === 'en' ? 'NO' : 'EN'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================
  // VIEW: PLAYER GAME
  // ===========================================
  // The actual bingo game interface for players
  // Shows 5x5 grid with input fields for names
  if (view === 'playerGame') {
    const hasWon = checkWin(playerNames);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <DiagnosticInfo />
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">
                  {t.appTitle}
                </h1>
                <p className="text-gray-600">{t.subtitle}</p>
                <p className="text-sm text-gray-500 mt-1">{t.playingAs}: <span className="font-semibold">{playerName}</span></p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={generateNewBoard}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Shuffle size={20} />
                  <span className="font-medium">{t.newBoard}</span>
                </button>
                <button
                  onClick={leaveGame}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {t.backToMenu}
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              {t.instructions}
            </div>

            {duplicateWarning && (
              <div className="mt-3 bg-yellow-100 border border-yellow-400 rounded-lg p-3 text-sm text-yellow-800 font-medium">
                ⚠️ {duplicateWarning}
              </div>
            )}
          </div>

          {hasWon && (
            <div className="bg-green-500 text-white text-center py-4 rounded-lg shadow-lg mb-6 text-2xl font-bold animate-pulse">
              🎉 {t.winMessage} 🎉
            </div>
          )}

          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6">
            <div className="grid grid-cols-5 gap-2 md:gap-3">
              {playerBoard.map((statement, index) => (
                <div
                  key={index}
                  className={`
                    aspect-square rounded-lg text-xs md:text-sm font-medium
                    transition-all duration-200 border-2 p-2
                    ${playerNames[index]
                      ? 'bg-indigo-600 border-indigo-700 shadow-lg'
                      : 'bg-white border-gray-300'
                    }
                    flex flex-col items-center justify-center text-center gap-1
                  `}
                >
                  <div className={`${playerNames[index] ? 'text-white' : 'text-gray-700'} leading-tight`}>
                    {statement}
                  </div>
                  <input
                    type="text"
                    value={playerNames[index] || ''}
                    onChange={(e) => toggleSquare(index, e.target.value)}
                    placeholder="Name"
                    className="w-full px-1 py-0.5 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>{t.filled}: {Object.keys(playerNames).length} / 25</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default IcebreakerBingo;