import React, { useEffect, useState } from 'react';
import { Clock, Users, Loader } from 'lucide-react';

/**
 * WaitingRoom Component
 * 
 * Displays a waiting screen for players who have joined a game
 * that hasn't started yet. Shows animated loading state and
 * participant count.
 */
const WaitingRoom = ({ 
  gameName,
  gameCode,
  playerCount,
  gridSize = 5,        // NEW
  winCondition = {},   // NEW
  language,
  translations 
}) => {
  const [dots, setDots] = useState('');
  const transText = translations[language] || translations.en;

  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Animated Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <Clock size={48} className="text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Loader size={16} className="text-yellow-900 animate-spin" />
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              {transText.waitingRoomTitle}
            </h1>
            <p className="text-xl text-gray-600">
              {transText.waitingRoomSubtitle}{dots}
            </p>
          </div>

          {/* Game Info */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-1">{transText.gameName}</p>
              <h2 className="text-2xl font-bold text-indigo-600">{gameName}</h2>
            </div>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-1">{transText.gameCode}</p>
              <p className="text-xl font-mono font-bold text-gray-800">{gameCode}</p>
            </div>
            
            {/* NEW: Game Configuration */}
            <div className="border-t border-indigo-200 pt-4 mt-4">
              <p className="text-xs text-gray-600 mb-2 text-center">{transText.gameConfiguration || 'Game Settings'}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white bg-opacity-60 rounded p-2 text-center">
                  <p className="text-gray-600 text-xs">{transText.gridSize || 'Grid'}</p>
                  <p className="font-bold text-indigo-900">{gridSize}×{gridSize}</p>
                </div>
                <div className="bg-white bg-opacity-60 rounded p-2 text-center">
                  <p className="text-gray-600 text-xs">{transText.toWin || 'To Win'}</p>
                  <p className="font-bold text-indigo-900">
                    {winCondition?.type === 'blackout'
                      ? (transText.fullBoard || 'Full')
                      : `${winCondition?.linesRequired || 1} ${transText.lines || 'lines'}`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Player Count */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-green-100 p-3 rounded-full">
              <Users size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{transText.playersWaiting}</p>
              <p className="text-2xl font-bold text-gray-800">{playerCount}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-center text-blue-800 font-medium">
              💡 {transText.waitingRoomInstructions}
            </p>
          </div>

          {/* What's Next */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <p className="text-gray-700">{transText.waitingStep1}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <p className="text-gray-700">{transText.waitingStep2}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <p className="text-gray-700">{transText.waitingStep3}</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {transText.waitingRoomFooter}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;