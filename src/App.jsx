import React, { useState, useEffect } from 'react';
import { Shuffle, Globe, Users, Copy, Check, Trophy, User, LogIn, LogOut, Lock } from 'lucide-react';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import * as gameService from './services/gameService';
import { useAuth } from './hooks/useAuth';
import { useGame } from './hooks/useGame';
import { usePlayer } from './hooks/usePlayer';
import { statements } from './data/statements';
import { translations } from './data/translations';
import LandingPage from './views/LandingPage';
import AdminLogin from './views/AdminLogin';
import AdminDashboard from './views/AdminDashboard';
import AdminGameView from './views/AdminGameView';
import PlayerJoin from './views/PlayerJoin';
import PlayerGame from './views/PlayerGame';


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
  const { currentUser, isAdmin, loginAdmin, loginAnonymous, logout } = useAuth();
  const game = useGame(currentUser, isAdmin);
  const { currentGameId, currentGame, myGames } = game;
  const player = usePlayer(translations, language);
  const {
    playerName, playerId, playerBoard, playerNames, duplicateWarning,
    setPlayerName, setPlayerId, setPlayerBoard, setPlayerNames,
    setDuplicateWarning, saveSession, clearSession, restoreSession, toggleSquare, checkWin
  } = player;
  
  // UI State
  const [copied, setCopied] = useState(false); // Shows "Copied!" feedback
  const [loading, setLoading] = useState(false); // Loading indicator
  const [error, setError] = useState(''); // Error message display
  const [prefilledGameCode, setPrefilledGameCode] = useState(gameCodeFromUrl ? gameCodeFromUrl.toUpperCase() : null); // Game code from URL



  // Sync with auth hook — handle admin navigation and load games
  useEffect(() => {
    if (currentUser?.email && view === 'adminLogin') {
      setView('adminDashboard');
    }
  }, [currentUser, view]);

  // Separate effect for loading games when admin logs in
  useEffect(() => {
    if (currentUser?.email && isAdmin) {
      game.loadMyGames();
    }
  }, [currentUser, isAdmin]);

  // Real-time subscription is handled by the `useGame` hook. Use `game.currentGame` / `game.currentGameId` instead of duplicating listeners here.

  // ===========================================
  // HELPER FUNCTIONS
  // ===========================================
  
  /**
   * Loads all games created by the specified admin
   * @param {string} adminId - Firebase UID of the admin
   */
	const loadMyGames = async () => {
	  try {
	    await game.loadMyGames();
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
	const handleAdminLogin = async (email, password) => {
    setLoading(true);
    setError('');

    try {
      const res = await loginAdmin(email, password);
      if (res.success) {
        setView('adminDashboard');
        await game.loadMyGames();
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Login failed');
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
      await logout();
      // Clear view and reset current game via hook
      game.setCurrentGameId(null);
      game.setCurrentGame(null);
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
   * Start a game (transition from pending to active)
   * @param {string} gameId - Game code to start
   */
  const handleStartGame = async (gameId) => {
    if (!window.confirm(transText.startGameConfirm)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await gameService.startGame(gameId, currentUser.uid);
      console.log('✅ Game started:', gameId);
      
      // Reload games to update status
      await game.loadMyGames();
      
      // If viewing this game, refresh it
      if (currentGameId === gameId) {
        const gameRef = doc(db, 'games', gameId);
        const docSnap = await getDoc(gameRef);
        if (docSnap.exists()) {
          game.setCurrentGame(docSnap.data());
        }
      }
      
      // Optional: Show success message
      // You could add a success state and display it
      console.log('✅', transText.gameStarted);
      
    } catch (err) {
      console.error('❌ Error starting game:', err);
      setError('Failed to start game: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Creates a new game in Firestore
   * @param {string} gameName - Display name for the game
   */
	const createGame = async (gameName) => {
	  if (!currentUser || !isAdmin) {
	    setError('Admin access required');
	    return;
	  }
	
	  setLoading(true);
	  setError('');
	
	  try {
	    const gameCode = await gameService.createGame({
	      name: gameName,
	      language: language,
	      adminId: currentUser.uid,
	      adminEmail: currentUser.email,
	      players: {}
	    });
	    
	    console.log('✅ Game created:', gameCode);
	    await game.loadMyGames();
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
	      game.setCurrentGame(gameData);
	      game.setCurrentGameId(gameId);
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
	  
    if (!window.confirm(transText.confirmEndGame)) {
      return;
    }
	
	  try {
	    await gameService.endGame(gameId);
	    await game.loadMyGames();
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
	  
    if (!window.confirm(transText.confirmDelete)) {
      return;
    }
	
	  try {
	    await gameService.deleteGame(gameId);
	    await game.loadMyGames();
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
      // Sign in anonymously for players (use auth hook)
      if (!currentUser) {
        await loginAnonymous();
      }

      console.log('🔍 Looking for game:', gameCode);
      const gameRef = doc(db, 'games', gameCode);
      const gameSnap = await getDoc(gameRef);

      if (!gameSnap.exists()) {
        setError(transText.invalidCode);
        setLoading(false);
        return;
      }

      const gameData = gameSnap.data();

      // Check if game has ended
      if (gameData.status === 'ended') {
        setError(language === 'en' ? 'This game has ended and is no longer accepting players.' : 'Dette spillet er avsluttet og tar ikke lenger imot spillere.');
        setLoading(false);
        return;
      }

      if (!name.trim()) {
        setError(transText.nameRequired);
        setLoading(false);
        return;
      }

      const newPlayerId = Date.now().toString();
      const board = generateBoard(gameData.language);

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

      // Only stores the game code string (e.g., "ABC123"). Doesn't include game name, status, players, etc. Just an identifier
      game.setCurrentGameId(gameCode);  

      // Store the full data / the entire game object:
      game.setCurrentGame(gameData);     

      setPlayerName(name.trim());
      setPlayerId(newPlayerId);
      setPlayerBoard(board);
      setPlayerNames({});
      //setLanguage(gameData.language);  // Keep whatver was selected during login, dont override
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

  // Player behavior handled by `usePlayer` hook (toggleSquare, checkWin, session persist)
  // The hook exposes: toggleSquare(index, name, gameId, playerId, shouldUpdate), checkWin(names), saveSession(), restoreSession(), clearSession(), etc.

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
    if (!window.confirm(transText.confirmLeaveGame)) {
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
    game.setCurrentGameId(null);
    game.setCurrentGame(null);
    setPlayerName('');
    setPlayerId(null);
    setPlayerBoard([]);
    setPlayerNames({});
    
    // Clear player session from sessionStorage
    sessionStorage.removeItem('playerSession');
    console.log('🗑️ Player session cleared');
    
    // Clear URL parameters
    window.history.replaceState({}, '', window.location.pathname);
    
    // Sign out anonymous user (use auth hook)
    if (currentUser && !currentUser.email) {
      await logout();
    }
  };

  // Get translations for current language
  const transText = translations[language] || translations.en;

  // ===========================================
  // DIAGNOSTIC COMPONENT (Temporary - for debugging)
  // ===========================================
  // TODO: Remove this component after deployment
  /*
  const DiagnosticInfo = () => (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs font-mono max-w-sm">
      <div className="font-bold mb-2 text-yellow-300">🔧 Debug Info:</div>
      <div>Current View: <span className="text-green-300">{view}</span></div>
      <div>URL Search: <span className="text-green-300">{window.location.search || '(empty)'}</span></div>
      <div>Game Code from URL: <span className="text-green-300">{prefilledGameCode || '(none)'}</span></div>
      <div>Is Admin: <span className="text-green-300">{isAdmin ? 'Yes' : 'No'}</span></div>
      <div>Current User: <span className="text-green-300">{currentUser ? (currentUser.email || 'Anonymous') : 'None'}</span></div>
      <div>Loading: <span className="text-green-300">{loading ? 'Yes' : 'No'}</span></div>
    </div>
  );
  */

  // ===========================================
  // VIEW: LANDING PAGE
  // ===========================================
  // Main entry point with two options:
  // 1. Admin Login - for game creators
  // 2. Join as Player - for participants
  if (view === 'landing') {
    return (
      <LandingPage
        currentUser={currentUser}
        isAdmin={isAdmin}
        language={language}
        translations={translations}
        onNavigate={setView}
        onLanguageToggle={() => setLanguage(language === 'en' ? 'no' : 'en')}
        onAdminLogout={handleAdminLogout}
      />
    );
  }

  // ===========================================
  // VIEW: ADMIN LOGIN
  // ===========================================
  // Email/password login form for administrators
  if (view === 'adminLogin') {
  return (
    <AdminLogin
      translations={translations}
      language={language}
      loading={loading}
      error={error}
      onLogin={handleAdminLogin}
      onBack={() => setView('landing')}
    />
  );
}

  // ===========================================
  // VIEW: ADMIN DASHBOARD
  // ===========================================
  // Shows all games created by this admin
  // Allows creating new games and managing existing ones
  if (view === 'adminDashboard') {
    return (
      <AdminDashboard
        currentUser={currentUser}
        language={language}
        translations={translations}
        myGames={game.myGames}
        loading={loading}
        onLanguageToggle={() => setLanguage(language === 'en' ? 'no' : 'en')}
        onLogout={handleAdminLogout}
        onCreateGame={createGame}
        onViewGame={viewGame}
        onStartGame={handleStartGame}
        onEndGame={endGame}
        onDeleteGame={deleteGame}
        onCopyGameLink={copySpecificGameLink}
      />
    );
  }

  // ===========================================
  // VIEW: ADMIN GAME VIEW
  // ===========================================
  // Detailed view of a specific game
  // Shows all players and their real-time progress
  if (view === 'adminGameView' && currentGame) {
    return (
      <AdminGameView
        currentGame={currentGame}
        currentGameId={currentGameId}
        language={language}
        translations={translations}
        loading={loading}
        checkWin={checkWin}
        copied={copied}
        onStartGame={handleStartGame}
        onRefresh={async () => {
          console.log('🔄 Manual refresh requested');
          setLoading(true);
          try {
            const gameRef = doc(db, 'games', currentGameId);
            const docSnap = await getDoc(gameRef);
            if (docSnap.exists()) {
              const gameData = docSnap.data();
              console.log('✅ Refreshed game data, players:', Object.keys(gameData.players || {}).length);
              game.setCurrentGame(gameData);
            } else {
              console.error('❌ Game not found');
            }
          } catch (err) {
            console.error('❌ Refresh error:', err);
          } finally {
            setLoading(false);
          }
        }}
        onCopyLink={copyGameLink}
        onBack={() => {
          setView('adminDashboard');
          game.setCurrentGameId(null);
          game.setCurrentGame(null);
        }}
      />
    );
  }

  // ===========================================
  // VIEW: PLAYER JOIN PAGE
  // ===========================================
  // Form for players to enter game code and name
  // Game code may be pre-filled from URL parameter
  // Admins are blocked from joining as players
  if (view === 'playerJoin') {
    return (
      <PlayerJoin
        currentUser={currentUser}
        isAdmin={isAdmin}
        language={language}
        translations={translations}
        loading={loading}
        error={error}
        prefilledGameCode={prefilledGameCode}
        onJoinGame={joinGameAsPlayer}
        onLanguageToggle={() => setLanguage(language === 'en' ? 'no' : 'en')}
        onBack={() => {
          setView('landing');
          setPrefilledGameCode(null);
          window.history.replaceState({}, '', window.location.pathname);
        }}
        onLogout={handleAdminLogout}
      />
    );
  }

  // ===========================================
  // VIEW: PLAYER GAME
  // ===========================================
  // The actual bingo game interface for players
  // Shows 5x5 grid with input fields for names
  if (view === 'playerGame') {
    const hasWon = checkWin(playerNames);
    const gameStatus = currentGame?.status || 'active';  // NEW
    const gameName = currentGame?.name || '';  // NEW
    const playerCount = Object.keys(currentGame?.players || {}).length;  // NEW

    return (
      <PlayerGame
        playerName={playerName}
        playerBoard={playerBoard}
        playerNames={playerNames}
        currentGameId={currentGameId}
        playerId={playerId}
        language={language}
        translations={translations}
        duplicateWarning={duplicateWarning}
        hasWon={hasWon}
        gameStatus={gameStatus}        // NEW
        gameName={gameName}            // NEW
        playerCount={playerCount}      // NEW
        onToggleSquare={toggleSquare}
        onGenerateNewBoard={generateNewBoard}
        onLeaveGame={leaveGame}
      />
    );
  }

  return null;
};

export default IcebreakerBingo;