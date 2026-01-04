import { useState } from 'react';
import * as gameService from '../services/gameService';

/**
 * Custom hook for player game logic
 * 
 * Handles:
 * - Player board state
 * - Square filling logic
 * - Duplicate name detection
 * - Win condition checking
 * - Session persistence
 * 
 * @param {Object} translations - Translation object
 * @param {string} language - Current language ('en' or 'no')
 */
export const usePlayer = (translations = null, language = 'en') => {
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [playerBoard, setPlayerBoard] = useState([]);
  const [playerNames, setPlayerNames] = useState({});
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [playerSessionRestored, setPlayerSessionRestored] = useState(false);

  /**
   * Toggle a square (fill with name or clear)
   * @param {number} index - Square index (0-24)
   * @param {string} name - Name to fill
   * @param {string} gameId - Current game ID
   * @param {string} playerId - Current player ID
   * @param {boolean} shouldUpdate - Whether to persist to Firebase
   * @returns {boolean} - True if successful, false if duplicate
   */
  const toggleSquare = (index, name, gameId, playerId, shouldUpdate = false) => {
    const trimmed = name.trim();
    
    // If empty, clear the square
    if (!trimmed) {
      const newNames = { ...playerNames };
      delete newNames[index];
      setPlayerNames(newNames);
      setDuplicateWarning(false);
      if (shouldUpdate) {
        gameService.updatePlayerProgress(gameId, playerId, newNames);
      }
      return true;
    }
    
    // Check for duplicates (case-insensitive)
    const existing = Object.entries(playerNames).find(
      ([idx, n]) => n.toLowerCase() === trimmed.toLowerCase() && parseInt(idx) !== index
    );
    
    if (existing) {
      setDuplicateWarning(`⚠️ "${trimmed}" is already used in another square!`);
      // Don't allow duplicate - return false to indicate failure
      return false;
    }
    
    // Clear any previous warning
    setDuplicateWarning(false);
    
    // Update the names
    const newNames = { ...playerNames, [index]: trimmed };
    setPlayerNames(newNames);
    
    // Persist to Firebase if needed
    if (shouldUpdate) {
      gameService.updatePlayerProgress(gameId, playerId, newNames);
    }
    
    return true;
  };

  /**
   * Check if player has won (5 in a row)
   */
  const checkWin = (names) => {
    const filled = Object.keys(names).map(k => parseInt(k));
    
    // Check rows
    for (let row = 0; row < 5; row++) {
      if ([0, 1, 2, 3, 4].every(col => filled.includes(row * 5 + col))) return true;
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
      if ([0, 1, 2, 3, 4].every(row => filled.includes(row * 5 + col))) return true;
    }
    
    // Check diagonals
    if ([0, 1, 2, 3, 4].every(i => filled.includes(i * 5 + i))) return true;
    if ([0, 1, 2, 3, 4].every(i => filled.includes(i * 5 + (4 - i)))) return true;
    
    return false;
  };

  /**
   * Save player session to sessionStorage
   */
  const saveSession = (gameId, playerId, playerName, board, names, language) => {
    const session = {
      gameId,
      playerId,
      playerName,
      playerBoard: board,
      playerNames: names,
      language
    };
    sessionStorage.setItem('playerSession', JSON.stringify(session));
    console.log('💾 Session saved');
  };

  /**
   * Clear player session
   */
  const clearSession = () => {
    sessionStorage.removeItem('playerSession');
    console.log('🗑️ Session cleared');
  };

  /**
   * Restore session from sessionStorage
   */
  const restoreSession = (urlGameCode, urlPlayerId) => {
    const saved = sessionStorage.getItem('playerSession');
    if (!saved) return null;
    
    try {
      const session = JSON.parse(saved);
      if (session.gameId === urlGameCode && session.playerId === urlPlayerId) {
        console.log('💾 Restoring session from storage');
        return session;
      }
    } catch (err) {
      console.error('❌ Session restore error:', err);
    }
    
    return null;
  };

  return {
    playerName,
    playerId,
    playerBoard,
    playerNames,
    duplicateWarning,
    playerSessionRestored,
    setPlayerName,
    setPlayerId,
    setPlayerBoard,
    setPlayerNames,
    setDuplicateWarning,
    setPlayerSessionRestored,
    toggleSquare,
    checkWin,
    saveSession,
    clearSession,
    restoreSession
  };
};