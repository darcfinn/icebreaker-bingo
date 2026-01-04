import React, { useEffect, useState } from 'react';
import { Shuffle } from 'lucide-react';
import WaitingRoom from '../components/WaitingRoom';

const PlayerGame = ({
  playerName,
  playerBoard,
  playerNames,
  currentGameId,
  playerId,
  language,
  translations,
  duplicateWarning,
  hasWon,
  gameStatus,
  gameName,
  playerCount,
  onToggleSquare,
  onGenerateNewBoard,
  onLeaveGame
}) => {
  const transText = translations[language] || translations.en;
  const [showStartNotification, setShowStartNotification] = useState(false);
  const [duplicateIndex, setDuplicateIndex] = useState(null);
  const [tempValues, setTempValues] = useState({});

  // Show notification when game starts
  useEffect(() => {
    if (gameStatus === 'active' && !showStartNotification) {
      setShowStartNotification(true);
      setTimeout(() => setShowStartNotification(false), 5000);
    }
  }, [gameStatus, showStartNotification]);

  // Show waiting room if game hasn't started
  if (gameStatus === 'pending') {
    return (
      <WaitingRoom
        gameName={gameName}
        gameCode={currentGameId}
        playerCount={playerCount}
        language={language}
        translations={translations}
      />
    );
  }

  const handleInputChange = (index, value) => {
    // Just update the temporary value, don't validate yet
    setTempValues(prev => ({ ...prev, [index]: value }));
    
    // Clear any existing duplicate warning for this field
    if (duplicateIndex === index) {
      setDuplicateIndex(null);
    }
  };

  const handleInputBlur = (index, value) => {
    const trimmedValue = value.trim();
    
    // If empty, just clear it
    if (!trimmedValue) {
      onToggleSquare(index, '', currentGameId, playerId, true);
      setTempValues(prev => {
        const newTemp = { ...prev };
        delete newTemp[index];
        return newTemp;
      });
      return;
    }
    
    // Validate and save
    const success = onToggleSquare(index, trimmedValue, currentGameId, playerId, true);
    
    if (!success) {
      // Duplicate detected - clear the field and show warning
      setDuplicateIndex(index);
      setTempValues(prev => {
        const newTemp = { ...prev };
        delete newTemp[index];
        return newTemp;
      });
      
      // Clear duplicate indicator after 3 seconds
      setTimeout(() => {
        setDuplicateIndex(null);
      }, 3000);
    } else {
      // Success - clear temp value
      setTempValues(prev => {
        const newTemp = { ...prev };
        delete newTemp[index];
        return newTemp;
      });
    }
  };

  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        {/* Start notification */}
        {showStartNotification && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <span className="font-bold text-lg">{transText.gameHasStarted}</span>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">
                  {transText.appTitle}
                </h1>
                <p className="text-gray-600">{transText.subtitle}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {transText.playingAs}: <span className="font-semibold">{playerName}</span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onGenerateNewBoard}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Shuffle size={20} />
                  <span className="font-medium">{transText.newBoard}</span>
                </button>
                <button
                  onClick={onLeaveGame}
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
              <div className="mt-3 bg-red-100 border-2 border-red-400 rounded-lg p-3 text-sm font-medium animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="text-red-600 text-xl">⚠️</span>
                  <span className="text-red-800">{duplicateWarning}</span>
                </div>
                <p className="text-red-600 text-xs mt-1">
                  {transText.duplicateNameHint || 'The field will be cleared when you click away.'}
                </p>
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
                    ${playerNames[index] && !tempValues[index]
                      ? 'bg-indigo-600 border-indigo-700 shadow-lg'
                      : duplicateIndex === index
                      ? 'bg-red-50 border-red-300'
                      : 'bg-white border-gray-300'
                    }
                    flex flex-col items-center justify-center text-center gap-1
                  `}
                >
                  <div className={`${playerNames[index] && !tempValues[index] ? 'text-white' : 'text-gray-700'} leading-tight`}>
                    {statement}
                  </div>
                  <input
                    type="text"
                    value={tempValues[index] !== undefined ? tempValues[index] : (playerNames[index] || '')}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onBlur={(e) => handleInputBlur(index, e.target.value)}
                    placeholder="Name"
                    className={`w-full px-1 py-0.5 text-xs text-center rounded focus:outline-none focus:ring-2 bg-white text-gray-900 ${
                      duplicateIndex === index 
                        ? 'border-2 border-red-500 focus:ring-red-500 animate-shake' 
                        : 'border border-gray-300 focus:ring-indigo-500'
                    }`}
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
    </>
  );
};

export default PlayerGame;