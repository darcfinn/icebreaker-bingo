import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import * as gameService from '../services/gameService';

/**
 * Custom hook for game management
 * 
 * Handles:
 * - Loading admin's games
 * - Real-time game data subscription
 * - Game CRUD operations
 */
export const useGame = (currentUser, isAdmin) => {
  const [myGames, setMyGames] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [currentGameId, setCurrentGameId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Load all games for current admin
   */
  const loadMyGames = async () => {
    if (!currentUser || !isAdmin) return;
    
    try {
      const games = await gameService.loadAdminGames(currentUser.uid);
      setMyGames(games);
    } catch (err) {
      console.error('❌ Error loading games:', err);
      setError('Failed to load games');
    }
  };

  /**
   * Create a new game
   */
  const createGame = async (gameName, language) => {
    if (!currentUser || !isAdmin) {
      setError('Admin access required');
      return { success: false };
    }

    setLoading(true);
    setError('');

    try {
      await gameService.createGame({
        name: gameName,
        language: language,
        adminId: currentUser.uid,
        adminEmail: currentUser.email,
        players: {}
      });
      
      await loadMyGames();
      return { success: true };
    } catch (err) {
      console.error('❌ Error creating game:', err);
      setError('Failed to create game');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load a specific game
   */
  const loadGame = async (gameId) => {
    setLoading(true);
    try {
      const gameData = await gameService.getGame(gameId);
      if (gameData) {
        setCurrentGame(gameData);
        setCurrentGameId(gameId);
        return { success: true, game: gameData };
      } else {
        setError('Game not found');
        return { success: false };
      }
    } catch (err) {
      console.error('❌ Error loading game:', err);
      setError('Failed to load game');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /**
   * End a game
   */
  const endGame = async (gameId) => {
    try {
      await gameService.endGame(gameId);
      await loadMyGames();
      return { success: true };
    } catch (err) {
      console.error('❌ Error ending game:', err);
      setError('Failed to end game');
      return { success: false };
    }
  };

  /**
   * Delete a game
   */
  const deleteGame = async (gameId) => {
    try {
      await gameService.deleteGame(gameId);
      await loadMyGames();
      return { success: true };
    } catch (err) {
      console.error('❌ Error deleting game:', err);
      setError('Failed to delete game');
      return { success: false };
    }
  };

  /**
   * Refresh current game data
   */
  const refreshGame = async () => {
    if (!currentGameId) return;
    setLoading(true);
    try {
      const gameData = await gameService.getGame(currentGameId);
      if (gameData) {
        setCurrentGame(gameData);
      }
    } catch (err) {
      console.error('❌ Refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription to current game
  useEffect(() => {
    if (!currentGameId || !currentUser) return;

    console.log('👀 Setting up real-time listener for:', currentGameId);

    const unsubscribe = onSnapshot(
      doc(db, 'games', currentGameId),
      (docSnap) => {
        if (docSnap.exists()) {
          const gameData = docSnap.data();
          console.log('📥 Real-time update - Players:', Object.keys(gameData.players || {}).length);
          setCurrentGame(gameData);
        }
      },
      (error) => {
        console.error('❌ Listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentGameId, currentUser]);

  return {
    myGames,
    currentGame,
    currentGameId,
    loading,
    error,
    setCurrentGameId,
    setCurrentGame,
    loadMyGames,
    createGame,
    loadGame,
    endGame,
    deleteGame,
    refreshGame,
    setError
  };
};