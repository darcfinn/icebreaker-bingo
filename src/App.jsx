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
  const player = usePlayer();
  const {
    playerName, playerId, playerBoard, playerNames,
    setPlayerName, setPlayerId, setPlayerBoard, setPlayerNames,
    setDuplicateWarning, saveSession, clearSession, restoreSession, toggleSquare, checkWin
  } = player;

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



  // Sync with auth hook — handle admin navigation and load games
  useEffect(() => {
    if (currentUser && currentUser.email) {
      if (view === 'adminLogin') {
        setView('adminDashboard');
      }
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
	const handleAdminLogin = async () => {
	  setLoading(true);
	  setError('');
	
	  try {
	    const res = await loginAdmin(adminEmail, adminPassword);
	    if (res.success) {
	      setAdminEmail('');
	      setAdminPassword('');
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
	  if (!window.confirm(translations[language].confirmEndGame)) {
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
	  if (!window.confirm(translations[language].confirmDelete)) {
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
        setError(translations[language].invalidCode);
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
        setError(translations[language].nameRequired);
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

      game.setCurrentGameId(gameCode);
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
          {currentUser && currentUser.email && (
            <div className="mb-6 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 w-3 h-3 rounded-full"></div>
                  <span>Logged in as: <strong>{currentUser.email}</strong></span>
                </div>
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  <span className="font-medium">{transText.logout}</span>
                </button>
              </div>
            </div>
          )}

          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-white mb-4">{transText.appTitle}</h1>
            <p className="text-2xl text-indigo-100">{transText.tagline}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Admin Login Card */}
            <div 
              onClick={() => {
                if (isAdmin) {
                  setView('adminDashboard');
                } else {
                  setView('adminLogin');
                }
              }}
              className="bg-white rounded-2xl shadow-2xl p-8 cursor-pointer transform transition-all hover:scale-105 hover:shadow-3xl"
            >
              <div className="text-center">
                <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {isAdmin ? <User size={40} className="text-indigo-600" /> : <LogIn size={40} className="text-indigo-600" /> }
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  {isAdmin ? 'Admin Dashboard' : transText.adminLogin}
                </h2>
                <p className="text-gray-600">
                  {isAdmin ? 'Manage your games' : 'Create and manage games'}
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
                <h2 className="text-2xl font-bold text-gray-800 mb-3">{transText.participate}</h2>
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
              <h1 className="text-3xl font-bold text-indigo-600">{transText.adminLogin}</h1>
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
                <label className="block text-gray-700 mb-2">{transText.email}</label>
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
                <label className="block text-gray-700 mb-2">{transText.password}</label>
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
                {loading ? transText.loading : transText.login}
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
                <h1 className="text-3xl font-bold text-indigo-600">{transText.myGames}</h1>
                <p className="text-gray-600 mt-1">Welcome, {currentUser?.email}</p>
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
                  <span className="font-medium">{transText.logout}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Create New Game */}
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{transText.createNewGame}</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder={transText.gameName}
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
                {loading ? transText.loading : transText.create}
              </button>
            </div>
          </div>

          {/* Games List */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            {game.myGames.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{transText.noGames}</p>
            ) : (
              <div className="space-y-4">
                {game.myGames.map(gameInstance => {
                  // Default to 'active' if status doesn't exist (for older games)
                  const gameStatus = gameInstance.status || 'active';
                  
                  return (
                  <div key={gameInstance.id} className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{gameInstance.name}</h3>
                          {gameStatus === 'ended' && (
                            <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded">
                              {transText.ended}
                            </span>
                          )}
                          {gameStatus === 'active' && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                              {transText.active}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {transText.gameCode}: <span className="font-mono font-bold text-indigo-600">{gameInstance.id}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {Object.keys(gameInstance.players || {}).length} players
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copySpecificGameLink(gameInstance.id)}
                          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                          title={transText.copyLink}
                        >
                          <Copy size={16} />
                          <span id={`copy-${gameInstance.id}`} className="text-xs"></span>
                        </button>
                        <button
                          onClick={() => viewGame(gameInstance.id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          {transText.viewGame}
                        </button>
                        {gameStatus === 'active' && (
                          <button
                            onClick={() => endGame(gameInstance.id)}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                          >
                            <Lock size={16} />
                            {transText.endGame}
                          </button>
                        )}
                        <button
                          onClick={() => deleteGame(gameInstance.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          {transText.deleteGame}
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
                  {transText.gameCode}: <span className="font-mono font-bold text-indigo-600">{currentGameId}</span>
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
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  title={transText.refresh}
                >
                  <Shuffle size={20} />
                  <span className="font-medium">{loading ? transText.loading : transText.refresh}</span>
                </button>
                <button
                  onClick={copyGameLink}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  <span className="font-medium">{copied ? transText.copied : transText.copyLink}</span>
                </button>
                <button
                  onClick={() => {
                    setView('adminDashboard');
                    game.setCurrentGameId(null);
                    game.setCurrentGame(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {transText.backToHome}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Users size={24} />
                {transText.registeredPlayers} ({sortedPlayers.length})
              </h2>
              
              {/* Sort Controls */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{transText.sortBy}</span>
                
                {/* Sort by selector */}
                <select
                  value={playerSortBy}
                  onChange={(e) => setPlayerSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="progress">{transText.progress}</option>
                  <option value="name">{transText.name}</option>
                </select>
                
                {/* Sort order selector */}
                <select
                  value={playerSortOrder}
                  onChange={(e) => setPlayerSortOrder(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="desc">{transText.descending}</option>
                  <option value="asc">{transText.ascending}</option>
                </select>
              </div>
            </div>

            {sortedPlayers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{transText.noPlayers}</p>
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
                              {transText.filled}: {filledCount} / 25
                            </p>
                          </div>
                        </div>
                        {hasBingo && (
                          <div className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
                            <Trophy size={20} />
                            {transText.hasBingo}
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
    if (isAdmin && currentUser?.email) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
          <DiagnosticInfo />
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-orange-600">{transText.adminCannotPlay}</h1>
                <button
                  onClick={() => setView('landing')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-gray-700 mb-4">{transText.adminPlayMessage}</p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">•</span>
                    <span>{transText.adminPlayStep1}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">•</span>
                    <span>{transText.adminPlayStep2}</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAdminLogout}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">{transText.logout}</span>
                </button>
                <button
                  onClick={() => setView('adminDashboard')}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {transText.backToHome}
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
              <h1 className="text-3xl font-bold text-indigo-600">{transText.participate}</h1>
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
                <label className="block text-gray-700 mb-2">{transText.enterGameCode}</label>
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
                <label className="block text-gray-700 mb-2">{transText.yourName}</label>
                <input
                  type="text"
                  placeholder={transText.yourName}
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
                {loading ? transText.loading : transText.join}
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
                  {transText.appTitle}
                </h1>
                <p className="text-gray-600">{transText.subtitle}</p>
                <p className="text-sm text-gray-500 mt-1">{transText.playingAs}: <span className="font-semibold">{playerName}</span></p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={generateNewBoard}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Shuffle size={20} />
                  <span className="font-medium">{transText.newBoard}</span>
                </button>
                <button
                  onClick={leaveGame}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {transText.backToMenu}
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              {transText.instructions}
            </div>

            {duplicateWarning && (
              <div className="mt-3 bg-yellow-100 border border-yellow-400 rounded-lg p-3 text-sm text-yellow-800 font-medium">
                ⚠️ {transText.duplicateWarning}
              </div>
            )}
          </div>

          {hasWon && (
            <div className="bg-green-500 text-white text-center py-4 rounded-lg shadow-lg mb-6 text-2xl font-bold animate-pulse">
              🎉 {transText.winMessage} 🎉
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
            <p>{transText.filled}: {Object.keys(playerNames).length} / 25</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default IcebreakerBingo;