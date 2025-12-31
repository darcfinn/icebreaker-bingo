import React, { useState, useEffect } from 'react';
import { Shuffle, Globe, Users, Copy, Check, Trophy, User } from 'lucide-react';

// Firebase configuration - REPLACE WITH YOUR CONFIG FROM FIREBASE CONSOLE

const firebaseConfig = {
  apiKey: "AIzaSyDNDryo1trXwkaQsFqMDQy7DkJxZuKXfBc",
  authDomain: "icebreaker-bingo-91a9c.firebaseapp.com",
  projectId: "icebreaker-bingo-91a9c",
  storageBucket: "icebreaker-bingo-91a9c.firebasestorage.app",
  messagingSenderId: "669185422322",
  appId: "1:669185422322:web:cfc4e11f13cdae1b18b16b",
  measurementId: "G-4KWXE85SQ8"
};

// Simple Firebase wrapper (we'll use Firebase SDK via CDN in HTML)
let db = null;

const IcebreakerBingo = () => {
  const [view, setView] = useState('menu');
  const [language, setLanguage] = useState('en');
  const [currentGameId, setCurrentGameId] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [playerBoard, setPlayerBoard] = useState([]);
  const [playerNames, setPlayerNames] = useState({});
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statements = {
    en: [
      "Has traveled to 5+ countries",
      "Speaks 3+ languages",
      "Has run a marathon",
      "Is a morning person",
      "Has met a celebrity",
      "Plays a musical instrument",
      "Has been skydiving",
      "Is left-handed",
      "Has a pet other than cat/dog",
      "Was born in the same month as you",
      "Has worked in 3+ countries",
      "Enjoys cooking",
      "Has been on TV",
      "Can do a handstand",
      "Has lived in 5+ cities",
      "Loves spicy food",
      "Has a hidden talent",
      "Enjoys hiking",
      "Has never broken a bone",
      "Is an only child",
      "Has written a book or blog",
      "Loves winter sports",
      "Can solve a Rubik's cube",
      "Has volunteered abroad",
      "Enjoys reading sci-fi",
      "Has the same hobby as you",
      "Is afraid of heights",
      "Drinks coffee every day",
      "Has been to Antarctica",
      "Loves karaoke",
      "Has the same favorite color",
      "Enjoys gardening",
      "Has run their own business",
      "Loves sushi",
      "Has attended a music festival",
      "Can speak backwards",
      "Has gone camping this year",
      "Prefers tea over coffee",
      "Has a collection hobby",
      "Loves board games"
    ],
    no: [
      "Har reist til 5+ land",
      "Snakker 3+ språk",
      "Har løpt maraton",
      "Er morgenmenneske",
      "Har møtt en kjendis",
      "Spiller et musikkinstrument",
      "Har prøvd fallskjermhopping",
      "Er venstrehendt",
      "Har et kjæledyr utenom katt/hund",
      "Er født i samme måned som deg",
      "Har jobbet i 3+ land",
      "Liker å lage mat",
      "Har vært på TV",
      "Kan stå på hendene",
      "Har bodd i 5+ byer",
      "Elsker sterk mat",
      "Har et skjult talent",
      "Liker fjelltur",
      "Har aldri brukket et bein",
      "Er enebarn",
      "Har skrevet bok eller blogg",
      "Elsker vintersport",
      "Kan løse Rubiks kube",
      "Har vært frivillig i utlandet",
      "Liker å lese sci-fi",
      "Har samme hobby som deg",
      "Er redd for høyder",
      "Drikker kaffe hver dag",
      "Har vært på Antarktis",
      "Elsker karaoke",
      "Har samme favorittfarge",
      "Liker hagearbeid",
      "Har drevet egen bedrift",
      "Elsker sushi",
      "Har vært på musikkfestival",
      "Kan snakke baklengs",
      "Har vært på camping i år",
      "Foretrekker te fremfor kaffe",
      "Har en samlerinteresse",
      "Elsker brettspill"
    ]
  };

  const translations = {
    en: {
      title: "Icebreaker Bingo",
      createGame: "Create New Game",
      joinGame: "Join Game",
      adminPanel: "Admin Panel",
      playerView: "Player View",
      gameName: "Game Name",
      gameCode: "Game Code",
      create: "Create",
      join: "Join",
      yourName: "Your Name",
      copyLink: "Copy Game Link",
      copied: "Copied!",
      registeredPlayers: "Registered Players",
      noPlayers: "No players yet",
      playerProgress: "Player Progress",
      hasBingo: "HAS BINGO!",
      backToMenu: "Back to Menu",
      subtitle: "Find people who match these descriptions!",
      newGame: "New Board",
      winMessage: "BINGO! You won!",
      instructions: "Type names in squares when you find matching people. Get 5 in a row to win!",
      filled: "Filled",
      enterGameCode: "Enter Game Code",
      invalidCode: "Invalid game code",
      nameRequired: "Please enter your name",
      firebaseNotConfigured: "Firebase is not configured. Please add your Firebase config to the code.",
      loading: "Loading..."
    },
    no: {
      title: "Icebreaker Bingo",
      createGame: "Opprett Nytt Spill",
      joinGame: "Bli Med i Spill",
      adminPanel: "Adminpanel",
      playerView: "Spillervisning",
      gameName: "Spillnavn",
      gameCode: "Spillkode",
      create: "Opprett",
      join: "Bli Med",
      yourName: "Ditt Navn",
      copyLink: "Kopier Spilllenke",
      copied: "Kopiert!",
      registeredPlayers: "Registrerte Spillere",
      noPlayers: "Ingen spillere ennå",
      playerProgress: "Spillerfremgang",
      hasBingo: "HAR BINGO!",
      backToMenu: "Tilbake til Meny",
      subtitle: "Finn personer som passer til disse beskrivelsene!",
      newGame: "Nytt Brett",
      winMessage: "BINGO! Du vant!",
      instructions: "Skriv inn navn i ruter når du finner personer som passer. Få 5 på rad for å vinne!",
      filled: "Fylt",
      enterGameCode: "Skriv Inn Spillkode",
      invalidCode: "Ugyldig spillkode",
      nameRequired: "Vennligst skriv inn navnet ditt",
      firebaseNotConfigured: "Firebase er ikke konfigurert. Vennligst legg til Firebase-konfigurasjon i koden.",
      loading: "Laster..."
    }
  };

  // Initialize Firebase (simulated - in real app would use Firebase SDK)
  useEffect(() => {
    // Check if Firebase is configured
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
      setError(translations[language].firebaseNotConfigured);
    }
  }, [language]);

  // Subscribe to game updates when in admin or player view
  useEffect(() => {
    if (!currentGameId) return;

    // Simulated Firebase real-time listener
    // In real implementation, this would be:
    // const unsubscribe = onSnapshot(doc(db, "games", currentGameId), (doc) => {
    //   if (doc.exists()) {
    //     setCurrentGame(doc.data());
    //   }
    // });
    // return () => unsubscribe();

    // For now, we'll use localStorage as a demo
    const interval = setInterval(() => {
      const stored = localStorage.getItem(`game_${currentGameId}`);
      if (stored) {
        setCurrentGame(JSON.parse(stored));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentGameId]);

  const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const generateBoard = (lang) => {
    const shuffled = [...statements[lang]].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 25);
  };

  const createGame = async (gameName) => {
    setLoading(true);
    const gameCode = generateGameCode();
    const newGame = {
      id: gameCode,
      name: gameName,
      language: language,
      players: {},
      createdAt: new Date().toISOString()
    };

    // In real Firebase: await setDoc(doc(db, "games", gameCode), newGame);
    localStorage.setItem(`game_${gameCode}`, JSON.stringify(newGame));

    setCurrentGameId(gameCode);
    setCurrentGame(newGame);
    setView('admin');
    setLoading(false);
  };

  const joinGame = async (gameCode, name) => {
    setLoading(true);
    
    // In real Firebase: const gameDoc = await getDoc(doc(db, "games", gameCode));
    const stored = localStorage.getItem(`game_${gameCode}`);
    
    if (!stored) {
      setError(translations[language].invalidCode);
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      setError(translations[language].nameRequired);
      setLoading(false);
      return;
    }

    const game = JSON.parse(stored);
    const newPlayerId = Date.now().toString();
    const board = generateBoard(game.language);
    
    const newPlayer = {
      id: newPlayerId,
      name: name.trim(),
      board: board,
      names: {},
      joinedAt: new Date().toISOString()
    };

    game.players[newPlayerId] = newPlayer;

    // In real Firebase: await updateDoc(doc(db, "games", gameCode), { [`players.${newPlayerId}`]: newPlayer });
    localStorage.setItem(`game_${gameCode}`, JSON.stringify(game));

    setCurrentGameId(gameCode);
    setCurrentGame(game);
    setPlayerName(name.trim());
    setPlayerId(newPlayerId);
    setPlayerBoard(board);
    setPlayerNames({});
    setLanguage(game.language);
    setView('player');
    setLoading(false);
    setError('');
  };

  const updatePlayerProgress = async (names) => {
    if (!currentGameId || !playerId) return;

    const stored = localStorage.getItem(`game_${currentGameId}`);
    if (!stored) return;

    const game = JSON.parse(stored);
    if (!game.players[playerId]) return;

    game.players[playerId].names = names;

    // In real Firebase: await updateDoc(doc(db, "games", currentGameId), { [`players.${playerId}.names`]: names });
    localStorage.setItem(`game_${currentGameId}`, JSON.stringify(game));
    setCurrentGame(game);
  };

  const toggleSquare = (index, name) => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      const newNames = { ...playerNames };
      delete newNames[index];
      setPlayerNames(newNames);
      setDuplicateWarning('');
      updatePlayerProgress(newNames);
      return;
    }
    
    const existingIndex = Object.entries(playerNames).find(
      ([idx, n]) => n.toLowerCase() === trimmedName.toLowerCase() && parseInt(idx) !== index
    );
    
    if (existingIndex) {
      setDuplicateWarning(language === 'en' 
        ? `Warning: ${trimmedName} is already used in another square!`
        : `Advarsel: ${trimmedName} er allerede brukt i en annen rute!`
      );
      setTimeout(() => setDuplicateWarning(''), 3000);
      return;
    }
    
    const newNames = { ...playerNames, [index]: trimmedName };
    setPlayerNames(newNames);
    setDuplicateWarning('');
    updatePlayerProgress(newNames);
  };

  const checkWin = (names) => {
    const filled = Object.keys(names).map(k => parseInt(k));
    
    for (let row = 0; row < 5; row++) {
      if ([0, 1, 2, 3, 4].every(col => filled.includes(row * 5 + col))) {
        return true;
      }
    }
    
    for (let col = 0; col < 5; col++) {
      if ([0, 1, 2, 3, 4].every(row => filled.includes(row * 5 + col))) {
        return true;
      }
    }
    
    if ([0, 1, 2, 3, 4].every(i => filled.includes(i * 5 + i))) {
      return true;
    }
    if ([0, 1, 2, 3, 4].every(i => filled.includes(i * 5 + (4 - i)))) {
      return true;
    }
    
    return false;
  };

  const copyGameLink = () => {
    const link = `Game Code: ${currentGameId}\nJoin at: ${window.location.origin}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateNewBoard = () => {
    if (!currentGame || !playerId) return;
    
    const newBoard = generateBoard(currentGame.language);
    setPlayerBoard(newBoard);
    const newNames = {};
    setPlayerNames(newNames);
    
    const stored = localStorage.getItem(`game_${currentGameId}`);
    if (stored) {
      const game = JSON.parse(stored);
      if (game.players[playerId]) {
        game.players[playerId].board = newBoard;
        game.players[playerId].names = newNames;
        localStorage.setItem(`game_${currentGameId}`, JSON.stringify(game));
        setCurrentGame(game);
      }
    }
  };

  const t = translations[language];

  // Error display
  if (error && error === t.firebaseNotConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-2xl bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-red-600 mb-4">⚠️ Configuration Required</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="bg-gray-100 rounded p-4 text-sm font-mono">
            <p className="mb-2">Replace the firebaseConfig object with your Firebase settings:</p>
            <pre className="text-xs overflow-x-auto">
{`const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Menu View
  if (view === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-bold text-indigo-600">{t.title}</h1>
              <button
                onClick={() => setLanguage(language === 'en' ? 'no' : 'en')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Globe size={20} />
                <span className="font-medium">{language === 'en' ? 'NO' : 'EN'}</span>
              </button>
            </div>

            {error && error !== t.firebaseNotConfigured && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="border-2 border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">{t.createGame}</h2>
                <input
                  type="text"
                  placeholder={t.gameName}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim() && !loading) {
                      createGame(e.target.value.trim());
                    }
                  }}
                  id="gameName"
                  disabled={loading}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('gameName');
                    if (input.value.trim() && !loading) {
                      createGame(input.value.trim());
                    }
                  }}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-400"
                >
                  {loading ? t.loading : t.create}
                </button>
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">{t.joinGame}</h2>
                <input
                  type="text"
                  placeholder={t.enterGameCode}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  id="joinGameCode"
                  disabled={loading}
                />
                <input
                  type="text"
                  placeholder={t.yourName}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  id="joinPlayerName"
                  disabled={loading}
                />
                <button
                  onClick={() => {
                    const code = document.getElementById('joinGameCode').value.trim().toUpperCase();
                    const name = document.getElementById('joinPlayerName').value.trim();
                    if (code && name && !loading) {
                      joinGame(code, name);
                    }
                  }}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400"
                >
                  {loading ? t.loading : t.join}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin View
  if (view === 'admin' && currentGame) {
    const players = Object.values(currentGame.players || {});

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-indigo-600">{t.adminPanel}</h1>
                <p className="text-gray-600 mt-1">{currentGame.name}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setLanguage(language === 'en' ? 'no' : 'en')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Globe size={20} />
                  <span className="font-medium">{language === 'en' ? 'NO' : 'EN'}</span>
                </button>
                <button
                  onClick={() => {
                    setView('menu');
                    setCurrentGameId(null);
                    setCurrentGame(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {t.backToMenu}
                </button>
              </div>
            </div>

            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t.gameCode}</p>
                  <p className="text-2xl font-bold text-indigo-600">{currentGameId}</p>
                </div>
                <button
                  onClick={copyGameLink}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  <span className="font-medium">{copied ? t.copied : t.copyLink}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={24} />
              {t.registeredPlayers} ({players.length})
            </h2>

            {players.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t.noPlayers}</p>
            ) : (
              <div className="space-y-4">
                {players.map(player => {
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
                              {t.filled}: {filledCount} / 25
                            </p>
                          </div>
                        </div>
                        {hasBingo && (
                          <div className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
                            <Trophy size={20} />
                            {t.hasBingo}
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
  }

  // Player View
  const hasWon = checkWin(playerNames);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">
                {t.title}
              </h1>
              <p className="text-gray-600">{t.subtitle}</p>
              <p className="text-sm text-gray-500 mt-1">Playing as: <span className="font-semibold">{playerName}</span></p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={generateNewBoard}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Shuffle size={20} />
                <span className="font-medium">{t.newGame}</span>
              </button>
              <button
                onClick={() => {
                  setView('menu');
                  setCurrentGameId(null);
                  setCurrentGame(null);
                  setPlayerName('');
                  setPlayerId(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {t.backToMenu}
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            {t.instructions}
          </div>

          {duplicateWarning && (
            <div className="mt-3 bg-yellow-100 border border-yellow-400 rounded-lg p-3 text-sm text-yellow-800 font-medium">
              ⚠️ {duplicateWarning}
            </div>
          )}
        </div>

        {hasWon && (
          <div className="bg-green-500 text-white text-center py-4 rounded-lg shadow-lg mb-6 text-2xl font-bold animate-pulse">
            🎉 {t.winMessage} 🎉
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
                  ${playerNames[index]
                    ? 'bg-indigo-600 border-indigo-700 shadow-lg'
                    : 'bg-white border-gray-300'
                  }
                  flex flex-col items-center justify-center text-center gap-1
                `}
              >
                <div className={`${playerNames[index] ? 'text-white' : 'text-gray-700'} leading-tight`}>
                  {statement}
                </div>
                <input
                  type="text"
                  value={playerNames[index] || ''}
                  onChange={(e) => toggleSquare(index, e.target.value)}
                  placeholder="Name"
                  className="w-full px-1 py-0.5 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>{t.filled}: {Object.keys(playerNames).length} / 25</p>
        </div>
      </div>
    </div>
  );
};

export default IcebreakerBingo;