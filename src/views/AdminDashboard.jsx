import React, { useState } from 'react';
import { Globe, LogOut, Copy, Lock, Play } from 'lucide-react';
import GameStatusBadge from '../components/GameStatusBadge';
import GridSizeSelector from '../components/GridSizeSelector';

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
  onStartGame,
  onEndGame,
  onDeleteGame,
  onCopyGameLink
}) => {
  const [newGameName, setNewGameName] = useState('');
  
  // NEW: Grid configuration state
  const [gridSize, setGridSize] = useState(4); // Default to 4×4 (mobile-friendly)
  const [winCondition, setWinCondition] = useState({ 
    type: 'lines', 
    linesRequired: 2  // Default to 2 lines (medium difficulty)
  });
  
  const transText = translations[language] || translations.en;

  const handleCreateGame = () => {
    if (newGameName.trim()) {
      
      console.log('🎮 Creating game with:', {
        name: newGameName.trim(),
        gridSize,
        winCondition
      });

      // Pass grid configuration to parent
      onCreateGame(newGameName.trim(), gridSize, winCondition);
      setNewGameName('');
      
      // Reset to defaults
      setGridSize(4);
      setWinCondition({ type: 'lines', linesRequired: 2 });
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

        {/* Create New Game - UPDATED SECTION */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-6">{transText.createNewGame}</h2>
          
          <div className="space-y-6">
            {/* Game Name Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                {transText.gameName}
              </label>
              <input
                type="text"
                placeholder={transText.gameNamePlaceholder || "e.g., Team Lunch Bingo"}
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                disabled={loading}
              />
            </div>
            
            {/* NEW: Grid Size Selector Component */}
            <GridSizeSelector
              gridSize={gridSize}
              winCondition={winCondition}
              language={language}
              translations={translations}
              onGridSizeChange={setGridSize}
              onWinConditionChange={setWinCondition}
            />
            
            {/* Create Button */}
            <button
              onClick={handleCreateGame}
              disabled={loading || !newGameName.trim()}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? transText.loading : transText.create}
            </button>
          </div>
        </div>

        {/* Games List - UPDATED TO SHOW GRID INFO */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">{transText.myGames}</h2>
          
          {myGames.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{transText.noGames}</p>
          ) : (
            <div className="space-y-4">
              {myGames.map(game => {
                const gameStatus = game.status || 'active';
                const gridSize = game.gridSize || 5;
                const winReq = game.winCondition?.type === 'blackout' 
                  ? (transText.blackout || 'Blackout')
                  : `${game.winCondition?.linesRequired || 1} ${(game.winCondition?.linesRequired || 1) === 1 ? transText.line : transText.lines}`;
                
                return (
                  <div key={game.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{game.name}</h3>
                          <GameStatusBadge 
                            status={gameStatus} 
                            translations={translations} 
                            language={language} 
                          />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {transText.gameCode}: <span className="font-mono font-bold text-indigo-600">{game.id}</span>
                        </p>
                        {/* NEW: Grid configuration display */}
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">{gridSize}×{gridSize}</span>
                            <span className="text-gray-400">({gridSize * gridSize} {transText.squares || 'squares'})</span>
                          </span>
                          <span className="text-gray-400">•</span>
                          <span>{transText.winRequirement}: <strong className="text-gray-700">{winReq}</strong></span>
                          <span className="text-gray-400">•</span>
                          <span>{Object.keys(game.players || {}).length} {transText.players}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => onCopyGameLink(game.id)}
                          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                          title={transText.copyLink}
                        >
                          <Copy size={16} />
                          <span id={`copy-${game.id}`} className="text-xs"></span>
                        </button>
                        
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