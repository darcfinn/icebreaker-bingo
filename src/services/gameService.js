import { 
  doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp,
  collection, query, where, getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Game Service
 * 
 * Handles all game-related Firestore operations:
 * - Creating games
 * - Loading games
 * - Starting games (pending → active)
 * - Updating game status
 * - Managing players
 * - Deleting games
 */

/**
 * Generate a random 6-character game code
 * @returns {string} Uppercase game code (e.g., "ABC123")
 */
export const generateGameCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Create a new game in Firestore
 * @param {Object} gameData - Game data object
 * @returns {Promise<string>} Game code
 */
export const createGame = async (gameData) => {
  const gameCode = generateGameCode();
  console.log('🎲 Creating game:', gameCode);
  
  await setDoc(doc(db, 'games', gameCode), {
    ...gameData,
    id: gameCode,
    status: 'pending',           // ✅ CHANGED: New games start as pending
    createdAt: serverTimestamp(),
    startedAt: null,             // ✅ ADDED: Track when game starts
    startedBy: null              // ✅ ADDED: Track who started it
  });
  
  console.log('✅ Game created with status: pending');
  return gameCode;
};

/**
 * Start a game (transition from pending to active)
 * @param {string} gameId - Game code
 * @param {string} adminId - Admin's Firebase UID
 * @returns {Promise<void>}
 */
export const startGame = async (gameId, adminId) => {
  console.log('🚀 Starting game:', gameId);
  
  // Verify game exists and is pending
  const gameSnap = await getDoc(doc(db, 'games', gameId));
  if (!gameSnap.exists()) {
    throw new Error('Game not found');
  }
  
  const gameData = gameSnap.data();
  if (gameData.status !== 'pending') {
    console.warn('⚠️ Game is not in pending state:', gameData.status);
    // Don't throw error, just update anyway
  }
  
  // Update to active
  await updateDoc(doc(db, 'games', gameId), {
    status: 'active',
    startedAt: serverTimestamp(),
    startedBy: adminId
  });
  
  console.log('✅ Game started successfully');
};

/**
 * Load all games for a specific admin
 * @param {string} adminId - Firebase UID of the admin
 * @returns {Promise<Array>} Array of game objects
 */
export const loadAdminGames = async (adminId) => {
  console.log('📂 Loading games for admin:', adminId);
  
  const gamesRef = collection(db, 'games');
  const q = query(gamesRef, where('adminId', '==', adminId));
  const querySnapshot = await getDocs(q);
  
  const games = [];
  querySnapshot.forEach((doc) => {
    games.push({ id: doc.id, ...doc.data() });
  });
  
  console.log('✅ Loaded games:', games.length);
  return games;
};

/**
 * Get a specific game by ID
 * @param {string} gameId - Game code
 * @returns {Promise<Object|null>} Game data or null if not found
 */
export const getGame = async (gameId) => {
  console.log('🔍 Fetching game:', gameId);
  const gameSnap = await getDoc(doc(db, 'games', gameId));
  
  if (gameSnap.exists()) {
    console.log('✅ Game found');
    return gameSnap.data();
  }
  
  console.log('❌ Game not found');
  return null;
};

/**
 * Add a player to a game
 * @param {string} gameId - Game code
 * @param {Object} playerData - Player data object
 * @returns {Promise<void>}
 */
export const addPlayerToGame = async (gameId, playerData) => {
  console.log('👤 Adding player to game:', gameId);
  
  await updateDoc(doc(db, 'games', gameId), {
    [`players.${playerData.id}`]: playerData
  });
  
  console.log('✅ Player added');
};

/**
 * Update player progress in a game
 * @param {string} gameId - Game code
 * @param {string} playerId - Player ID
 * @param {Object} names - Filled squares {index: name}
 * @returns {Promise<void>}
 */
export const updatePlayerProgress = async (gameId, playerId, names) => {
  console.log('💾 Updating player progress');
  
  await updateDoc(doc(db, 'games', gameId), {
    [`players.${playerId}.names`]: names
  });
  
  console.log('✅ Progress updated');
};

/**
 * Remove a player from a game
 * @param {string} gameId - Game code
 * @param {string} playerId - Player ID to remove
 * @returns {Promise<void>}
 */
export const removePlayerFromGame = async (gameId, playerId) => {
  console.log('🗑️ Removing player from game');
  
  const gameSnap = await getDoc(doc(db, 'games', gameId));
  if (gameSnap.exists()) {
    const gameData = gameSnap.data();
    const updatedPlayers = { ...gameData.players };
    delete updatedPlayers[playerId];
    
    await updateDoc(doc(db, 'games', gameId), {
      players: updatedPlayers
    });
    
    console.log('✅ Player removed');
  }
};

/**
 * Update player's board (for generating new board)
 * @param {string} gameId - Game code
 * @param {string} playerId - Player ID
 * @param {Array} board - New board array
 * @returns {Promise<void>}
 */
export const updatePlayerBoard = async (gameId, playerId, board) => {
  await updateDoc(doc(db, 'games', gameId), {
    [`players.${playerId}.board`]: board,
    [`players.${playerId}.names`]: {}
  });
};

/**
 * End a game (blocks new players but preserves data)
 * @param {string} gameId - Game code
 * @returns {Promise<void>}
 */
export const endGame = async (gameId) => {
  console.log('🔒 Ending game:', gameId);
  
  await updateDoc(doc(db, 'games', gameId), {
    status: 'ended',
    endedAt: serverTimestamp()
  });
  
  console.log('✅ Game ended');
};

/**
 * Delete a game permanently
 * @param {string} gameId - Game code
 * @returns {Promise<void>}
 */
export const deleteGame = async (gameId) => {
  console.log('🗑️ Deleting game:', gameId);
  await deleteDoc(doc(db, 'games', gameId));
  console.log('✅ Game deleted');
};