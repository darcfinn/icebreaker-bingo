import React, { useState } from 'react';
import { Users, Copy, Check, Shuffle, Trophy, User, Play } from 'lucide-react';
import GameStatusBadge from '../components/GameStatusBadge';

const AdminGameView = ({
  currentGame,
  currentGameId,
  language,
  translations,
  loading,
  checkWin,
  copied,
  onStartGame,
  onRefresh,
  onCopyLink,
  onBack
}) => {
  const [playerSortBy, setPlayerSortBy] = useState('progress'); // 'progress' or 'name'
  const [playerSortOrder, setPlayerSortOrder] = useState('desc'); // 'asc' or 'desc'
  
  const transText = translations[language] || translations.en;
  const players = Object.values(currentGame.players || {});
  const playerCount = players.length;
  
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

  // Handle start game with validations
  const handleStartGameClick = () => {
    // Validation: No players
    if (playerCount === 0) {
      alert(transText.cannotStartNoPlayers);
      return;
    }

    // Warning: Only 1-2 players
    if (playerCount <= 2) {
      const warningMsg = language === 'en'
        ? `Warning: Only ${playerCount} player${playerCount === 1 ? '' : 's'} ${playerCount === 1 ? 'has' : 'have'} joined. The game will be very difficult to complete with so few players. Do you want to start anyway?`
        : `Advarsel: Bare ${playerCount} spiller${playerCount === 1 ? '' : 'e'} har blitt med. Spillet vil være veldig vanskelig å fullføre med så få spillere. Vil du starte likevel?`;
      
      if (!window.confirm(warningMsg)) {
        return;
      }
    }

    // Proceed with normal confirmation
    onStartGame(currentGameId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-indigo-600">{currentGame.name}</h1>
                <GameStatusBadge 
                  status={currentGame.status || 'active'} 
                  translations={translations} 
                  language={language} 
                />
              </div>
              <p className="text-sm text-gray-600">
                {transText.gameCode}: <span className="font-mono font-bold text-indigo-600">{currentGameId}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {playerCount} {playerCount === 1 ? (transText.player || 'player') : (transText.players || 'players')} • {transText.language}: {currentGame.language === 'en' ? 'English' : 'Norsk'}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap justify-end">
              {/* START GAME BUTTON */}
              {currentGame.status === 'pending' && (
                <button
                  onClick={handleStartGameClick}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Play size={24} />
                  <span>{transText.startGame}</span>
                </button>
              )}
              
              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                title={transText.refresh}
              >
                <Shuffle size={20} />
                <span className="font-medium">{loading ? transText.loading : transText.refresh}</span>
              </button>
              <button
                onClick={onCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
                <span className="font-medium">{copied ? transText.copied : transText.copyLink}</span>
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {transText.backToHome}
              </button>
            </div>
          </div>

          {/* Warning banner for pending games with no/few players */}
            {currentGame.status === 'pending' && (
              <div className="mt-4">
                {playerCount === 0 && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-red-800">
                        {language === 'en' ? 'No players yet' : 'Ingen spillere ennå'}
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {transText.shareGameCode}
                      </p>
                    </div>
                  </div>
                )}
                
                {playerCount > 0 && playerCount <= 2 && (
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-yellow-800">
                        {transText.fewPlayers}
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        {language === 'en' 
                          ? `With only ${playerCount} player${playerCount === 1 ? '' : 's'}, completing the bingo will be very difficult. Consider waiting for more players to join.`
                          : `Med bare ${playerCount} spiller${playerCount === 1 ? '' : 'e'} vil det være veldig vanskelig å fullføre bingoen. Vurder å vente på flere spillere.`
                        }
                      </p>
                    </div>
                  </div>
                )}

                {playerCount >= 3 && (
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-semibold text-green-800">
                        {transText.readyToStart}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        {language === 'en'
                          ? `${playerCount} players are waiting. Click "Start Game" when everyone is ready.`
                          : `${playerCount} spillere venter. Klikk "Start spill" når alle er klare.`
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>

        {/* Players List */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users size={24} />
              {transText.registeredPlayers} ({sortedPlayers.length})
            </h2>
            
            {/* Sort Controls */}
            {sortedPlayers.length > 1 && (
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
            )}
          </div>

          {sortedPlayers.length === 0 ? (
            <div className="text-center py-12">
              <Users size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">{transText.noPlayers}</p>
              <p className="text-gray-400 text-sm mt-2">
                {transText.shareCodeToStart || 'Share the game code with participants to get started'}
              </p>
            </div>
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
};

export default AdminGameView;