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
 */
export const usePlayer = () => {
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [playerBoard, setPlayerBoard] = useState([]);
  const [playerNames, setPlayerNames] = useState({});
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [playerSessionRestored, setPlayerSessionRestored] = useState(false);

  /**
   * Toggle a square (fill with name or clear)
   */
  const toggleSquare = (index, name, gameId, playerId, shouldUpdate = false) => {
    const trimmed = name.trim();
    
    if (!trimmed) {
      const newNames = { ...playerNames };
      delete newNames[index];
      setPlayerNames(newNames);
      setDuplicateWarning('');
      if (shouldUpdate) {
        gameService.updatePlayerProgress(gameId, playerId, newNames);
      }
      return;
    }
    
    // Check for duplicates
    const existing = Object.entries(playerNames).find(
      ([idx, n]) => n.toLowerCase() === trimmed.toLowerCase() && parseInt(idx) !== index
    );
    
    if (existing && shouldUpdate) {
      setDuplicateWarning(`Warning: ${trimmed} is already used in another square!`);
      setTimeout(() => setDuplicateWarning(''), 3000);
      return;
    }
    
    const newNames = { ...playerNames, [index]: trimmed };
    setPlayerNames(newNames);
    setDuplicateWarning('');
    
    if (shouldUpdate) {
      gameService.updatePlayerProgress(gameId, playerId, newNames);
    }
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