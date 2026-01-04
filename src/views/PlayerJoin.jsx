import React, { useState, useEffect } from 'react';
import { Globe, LogOut } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const PlayerJoin = ({
  currentUser,
  isAdmin,
  language,
  translations,
  loading,
  error,
  prefilledGameCode,
  onJoinGame,
  onLanguageToggle,
  onBack,
  onLogout
}) => {
  const [gameCode, setGameCode] = useState(prefilledGameCode || '');
  const [playerName, setPlayerName] = useState('');
  const [gameInfo, setGameInfo] = useState(null);
  const [loadingGameInfo, setLoadingGameInfo] = useState(false);
  
  const transText = translations[language] || translations.en;

  // Fetch game info when game code is prefilled or entered
  useEffect(() => {
    const fetchGameInfo = async () => {
      if (gameCode && gameCode.length === 6) {
        setLoadingGameInfo(true);
        try {
          const gameRef = doc(db, 'games', gameCode.toUpperCase());
          const gameSnap = await getDoc(gameRef);
          
          if (gameSnap.exists()) {
            setGameInfo(gameSnap.data());
          } else {
            setGameInfo(null);
          }
        } catch (err) {
          console.error('Error fetching game info:', err);
          setGameInfo(null);
        } finally {
          setLoadingGameInfo(false);
        }
      } else {
        setGameInfo(null);
      }
    };

    const timeoutId = setTimeout(fetchGameInfo, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [gameCode]);

  const handleSubmit = () => {
    if (gameCode.trim() && playerName.trim()) {
      onJoinGame(gameCode.trim().toUpperCase(), playerName.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && gameCode.trim() && playerName.trim()) {
      handleSubmit();
    }
  };

  // Block admins from joining as players
  if (isAdmin && currentUser?.email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-orange-600">{transText.adminCannotPlay}</h1>
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-gray-700 mb-4">{transText.adminPlayMessage}</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>{transText.adminPlayStep1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>{transText.adminPlayStep2}</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onLogout}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">{transText.logout}</span>
              </button>
              <button
                onClick={onBack}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                {transText.backToHome}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-indigo-600">{transText.participate}</h1>
            <button
              onClick={() => {
                onBack();
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Game Info Display */}
          {gameInfo && (
            <div className="mb-4 bg-blue-50 border border-blue-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 mb-1">
                    {gameInfo.name}
                  </p>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      {transText.gameLanguage}: <strong>{gameInfo.language === 'en' ? 'English' : 'Norsk'}</strong>
                    </p>
                    <p>
                      {transText.status}: <strong>
                        {gameInfo.status === 'pending' 
                          ? (transText.pending || 'Pending')
                          : gameInfo.status === 'active'
                          ? (transText.active || 'Active')
                          : (transText.ended || 'Ended')
                        }
                      </strong>
                    </p>
                    <p>
                      {transText.players}: <strong>{Object.keys(gameInfo.players || {}).length}</strong>
                    </p>
                  </div>
                  {gameInfo.status === 'ended' && (
                    <p className="text-sm text-red-600 font-medium mt-2">
                      ⚠️ {transText.gameHasEnded || 'This game has ended'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {loadingGameInfo && (
            <div className="mb-4 bg-gray-50 border border-gray-300 rounded-lg p-4 text-center text-gray-600">
              {transText.loadingGameInfo || 'Loading game info...'}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">{transText.enterGameCode}</label>
              <input
                type="text"
                placeholder="ABC123"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                disabled={loading}
                maxLength={6}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">{transText.yourName}</label>
              <input
                type="text"
                placeholder={transText.yourName}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !gameCode.trim() || !playerName.trim() || gameInfo?.status === 'ended'}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? transText.loading : transText.join}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onLanguageToggle}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors mx-auto"
            >
              <Globe size={20} />
              <span className="font-medium">{language === 'en' ? 'NO' : 'EN'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerJoin;