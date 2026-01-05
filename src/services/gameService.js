import { 
  doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp,
  collection, query, where, getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Game Service
 * 
 * Handles all game-related Firestore operations with flexible grid support
 */

/**
 * Generate a random 6-character game code
 */
export const generateGameCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Create a new game in Firestore
 * @param {Object} gameData - Game data object
 * @param {number} gameData.gridSize - Grid size (3, 4, or 5)
 * @param {Object} gameData.winCondition - Win condition config
 * @returns {Promise<string>} Game code
 */
export const createGame = async (gameData) => {
  const gameCode = generateGameCode();
  console.log('🎲 Creating game:', gameCode);
  
  // Set defaults for backward compatibility
  const gridSize = gameData.gridSize || 5;
  const winCondition = gameData.winCondition || { type: 'lines', linesRequired: 1 };
  
  await setDoc(doc(db, 'games', gameCode), {
    ...gameData,
    id: gameCode,
    gridSize,
    winCondition,
    status: 'pending',
    createdAt: serverTimestamp(),
    startedAt: null,
    startedBy: null
  });
  
  console.log(`✅ Game created: ${gridSize}×${gridSize}, win: ${winCondition.type === 'blackout' ? 'blackout' : winCondition.linesRequired + ' lines'}`);
  return gameCode;
};

/**
 * Start a game (transition from pending to active)
 */
export const startGame = async (gameId, adminId) => {
  console.log('🚀 Starting game:', gameId);
  
  const gameSnap = await getDoc(doc(db, 'games', gameId));
  if (!gameSnap.exists()) {
    throw new Error('Game not found');
  }
  
  const gameData = gameSnap.data();
  if (gameData.status !== 'pending') {
    console.warn('⚠️ Game is not in pending state:', gameData.status);
  }
  
  await updateDoc(doc(db, 'games', gameId), {
    status: 'active',
    startedAt: serverTimestamp(),
    startedBy: adminId
  });
  
  console.log('✅ Game started successfully');
};

/**
 * Load all games for a specific admin
 */
export const loadAdminGames = async (adminId) => {
  console.log('📂 Loading games for admin:', adminId);
  
  const gamesRef = collection(db, 'games');
  const q = query(gamesRef, where('adminId', '==', adminId));
  const querySnapshot = await getDocs(q);
  
  const games = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    // Add defaults for old games without gridSize
    games.push({ 
      id: doc.id, 
      ...data,
      gridSize: data.gridSize || 5,
      winCondition: data.winCondition || { type: 'lines', linesRequired: 1 }
    });
  });
  
  console.log('✅ Loaded games:', games.length);
  return games;
};

/**
 * Get a specific game by ID
 */
export const getGame = async (gameId) => {
  console.log('🔍 Fetching game:', gameId);
  const gameSnap = await getDoc(doc(db, 'games', gameId));
  
  if (gameSnap.exists()) {
    const data = gameSnap.data();
    console.log('✅ Game found');
    // Add defaults for backward compatibility
    return {
      ...data,
      gridSize: data.gridSize || 5,
      winCondition: data.winCondition || { type: 'lines', linesRequired: 1 }
    };
  }
  
  console.log('❌ Game not found');
  return null;
};

/**
 * Add a player to a game
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
 */
export const updatePlayerBoard = async (gameId, playerId, board) => {
  await updateDoc(doc(db, 'games', gameId), {
    [`players.${playerId}.board`]: board,
    [`players.${playerId}.names`]: {}
  });
};

/**
 * End a game (blocks new players but preserves data)
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
 */
export const deleteGame = async (gameId) => {
  console.log('🗑️ Deleting game:', gameId);
  await deleteDoc(doc(db, 'games', gameId));
  console.log('✅ Game deleted');
};