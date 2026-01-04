import React, { useState } from 'react';
import GameStatusBadge from '../components/GameStatusBadge';
import { Globe, LogOut, Copy, Lock, Play } from 'lucide-react';

const AdminDashboard = ({
  currentUser,
  language,
  translations,
  myGames,
  loading,
  onLanguageToggle,
  onLogout,
  onCreateGame,
  onViewGame,
  onEndGame,
  onDeleteGame,
  onCopyGameLink,
  onStartGame
}) => {
  const [newGameName, setNewGameName] = useState('');
  const transText = translations[language] || translations.en;

  const handleCreateGame = () => {
    if (newGameName.trim()) {
      onCreateGame(newGameName.trim());
      setNewGameName('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && newGameName.trim()) {
      handleCreateGame();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
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
                onClick={onLanguageToggle}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Globe size={20} />
                <span className="font-medium">{language === 'en' ? 'NO' : 'EN'}</span>
              </button>
              <button
                onClick={onLogout}
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
              value={newGameName}
              onChange={(e) => setNewGameName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            <button
              onClick={handleCreateGame}
              disabled={loading || !newGameName.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-400"
            >
              {loading ? transText.loading : transText.create}
            </button>
          </div>
        </div>

        {/* Games List */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          {myGames.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{transText.noGames}</p>
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
                            <GameStatusBadge 
                                status={gameStatus} 
                                translations={translations} 
                                language={language} 
                            />
                        </div>
                        <p className="text-sm text-gray-600">
                          {transText.gameCode}: <span className="font-mono font-bold text-indigo-600">{game.id}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {Object.keys(game.players || {}).length} players
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                            onClick={() => onCopyGameLink(game.id)}
                            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                            title={transText.copyLink}
                        >
                            <Copy size={16} />
                            <span id={`copy-${game.id}`} className="text-xs"></span>
                        </button>
                        
                        {/* START GAME BUTTON - NEW */}
                        {gameStatus === 'pending' && (
                            <button
                            onClick={() => onStartGame(game.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold"
                            >
                            <Play size={16} />
                            {transText.startGame}
                            </button>
                        )}
                        
                        <button
                            onClick={() => onViewGame(game.id)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            {transText.viewGame}
                        </button>
                        {gameStatus === 'active' && (
                            <button
                            onClick={() => onEndGame(game.id)}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                            >
                            <Lock size={16} />
                            {transText.endGame}
                            </button>
                        )}
                        <button
                            onClick={() => onDeleteGame(game.id)}
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
};

export default AdminDashboard;