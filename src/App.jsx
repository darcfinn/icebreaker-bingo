import React, { useState, useEffect } from 'react';
import { Shuffle, Globe, Users, Copy, Check, Trophy, User } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDNDryo1trXwkaQsFqMDQy7DkJxZuKXfBc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "icebreaker-bingo-91a9c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "icebreaker-bingo-91a9c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "icebreaker-bingo-91a9c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "669185422322",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:669185422322:web:cfc4e11f13cdae1b18b16b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DIAGNOSTIC LOGGING
console.log('🔥 Firebase initialized:', {
  app: app.name,
  authConfigured: !!auth,
  dbConfigured: !!db,
  projectId: firebaseConfig.projectId
});

const IcebreakerBingo = () => {
  const [view, setView] = useState('menu');
  const [language, setLanguage] = useState('en');
  const [currentUser, setCurrentUser] = useState(null);
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
  const [isAdmin, setIsAdmin] = useState(false);

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
      "Loves board games",
      "Has baked at home",
      "Can ride a bike with no hands",
      "Has seen the northern lights",
      "Loves pizza",
      "Can whistle a tune",
      "Has been to the cabin this summer",
      "Likes to draw or paint",
      "Has the same favorite movie as you",
      "Can do a cartwheel",
      "Has picked berries in the forest",
      "Loves to swim",
      "Has built a snowman this year",
      "Likes to play video games",
      "Has been on a cruise",
      "Loves ice cream",
      "Has the same number of siblings as you",
      "Likes to dance",
      "Has been to an amusement park",
      "Can play cards",
      "Has gone camping",
      "Loves to sleep in",
      "Has been to a football match",
      "Likes building with Lego",
      "Can sew a button",
      "Has been skiing this year",
      "Loves chocolate",
      "Has visited a museum",
      "Likes to sing",
      "Has fished in the sea or river",
      "Loves pancakes",
      "Has the same lucky number as you",
      "Likes to run",
      "Has traveled abroad this year",
      "Can play chess",
      "Has planted something in the garden",
      "Loves Taco Friday",
      "Has been to a concert",
      "Likes to read comics",
      "Has the same shoe size as you",
      "Can make a paper airplane",
      "Has been to Bergen",
      "Loves popcorn",
      "Has gone hiking",
      "Likes home improvement",
      "Has the same favorite season as you",
      "Can ride a scooter",
      "Has been to the cinema this year",
      "Loves waffles"
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
      "Elsker brettspill",
      "Har bakt boller hjemme",
      "Kan sykle uten hender",
      "Har sett nordlyset",
      "Elsker pizza",
      "Kan fløyte en melodi",
      "Har vært på hytta i sommer",
      "Liker å tegne eller male",
      "Har samme yndlingsfilm som deg",
      "Kan hoppe bukk",
      "Har plukket bær i skogen",
      "Elsker å svømme",
      "Har bygget snømann i år",
      "Liker å spille videospill",
      "Kan gjøre hjulet",
      "Har vært på cruise",
      "Elsker is",
      "Har samme antall søsken som deg",
      "Liker å danse",
      "Har vært på Tusenfryd",
      "Kan spille kort",
      "Har dratt på campingtur",
      "Elsker å sove lenge",
      "Har vært på fotballkamp",
      "Liker å lage Lego",
      "Har samme yndlingsfarge som deg",
      "Kan sy på knapp",
      "Har gått på ski i år",
      "Elsker sjokolade",
      "Har vært på museum",
      "Liker å synge",
      "Har fisket i sjøen eller elv",
      "Elsker pannekaker",
      "Har samme yndlingstall som deg",
      "Liker å løpe",
      "Har vært i utlandet i år",
      "Kan spille sjakk",
      "Har plantet noe i hagen",
      "Elsker fredagstaco",
      "Har vært på konsert",
      "Liker å lese tegneserier",
      "Har samme skostørrelse som deg",
      "Kan lage papirfly",
      "Har vært i Bergen",
      "Elsker popcorn",
      "Har gått en tur i marka",
      "Liker å pusse opp",
      "Har samme favorittårstid som deg",
      "Kan stå på sparkesykkel",
      "Har vært på kino i år",
      "Elsker vafler"
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
      loading: "Loading...",
      signIn: "Connecting...",
      deleteGame: "Delete Game",
      confirmDelete: "Are you sure you want to delete this game?"
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
      loading: "Laster...",
      signIn: "Kobler til...",
      deleteGame: "Slett Spill",
      confirmDelete: "Er du sikker på at du vil slette dette spillet?"
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('✅ User authenticated:', user.uid);
        setCurrentUser(user);
      } else {
        console.log('🔄 Signing in anonymously...');
        try {
          const result = await signInAnonymously(auth);
          console.log('✅ Anonymous sign-in successful:', result.user.uid);
        } catch (err) {
          console.error('❌ Auth error:', err);
          setError('Authentication failed: ' + err.message);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to game updates
  useEffect(() => {
    if (!currentGameId) return;

    console.log('👀 Subscribing to game:', currentGameId);

    const unsubscribe = onSnapshot(
      doc(db, 'games', currentGameId),
      (docSnap) => {
        if (docSnap.exists()) {
          const gameData = docSnap.data();
          console.log('📥 Game data updated:', gameData);
          setCurrentGame(gameData);
          
          // Check if current user is admin
          if (currentUser && gameData.adminId === currentUser.uid) {
            setIsAdmin(true);
          }

          // If player view, load their board
          if (playerId && gameData.players && gameData.players[playerId]) {
            const player = gameData.players[playerId];
            setPlayerBoard(player.board || []);
            setPlayerNames(player.names || {});
          }
        } else {
          console.error('❌ Game not found');
          setError('Game not found');
        }
      },
      (error) => {
        console.error('❌ Error listening to game:', error);
        setError('Failed to load game: ' + error.message);
      }
    );

    return () => unsubscribe();
  }, [currentGameId, currentUser, playerId]);

  const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const generateBoard = (lang) => {
    const shuffled = [...statements[lang]].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 25);
  };

  const createGame = async (gameName) => {
    if (!currentUser) {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const gameCode = generateGameCode();
      console.log('📝 Creating game:', gameCode);
      
      const gameData = {
        id: gameCode,
        name: gameName,
        language: language,
        adminId: currentUser.uid,
        players: {},
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'games', gameCode), gameData);
      console.log('✅ Game created successfully in Firestore');

      setCurrentGameId(gameCode);
      setIsAdmin(true);
      setView('admin');
    } catch (err) {
      console.error('❌ Error creating game:', err);
      setError('Failed to create game: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async (gameCode, name) => {
    if (!currentUser) {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔍 Looking for game:', gameCode);
      const gameRef = doc(db, 'games', gameCode);
      const gameSnap = await getDoc(gameRef);

      if (!gameSnap.exists()) {
        setError(translations[language].invalidCode);
        setLoading(false);
        return;
      }

      if (!name.trim()) {
        setError(translations[language].nameRequired);
        setLoading(false);
        return;
      }

      const gameData = gameSnap.data();
      const newPlayerId = Date.now().toString();
      const board = generateBoard(gameData.language);

      const newPlayer = {
        id: newPlayerId,
        name: name.trim(),
        board: board,
        names: {},
        joinedAt: new Date().toISOString()
      };

      console.log('👤 Joining game as:', name.trim());

      // Update game with new player
      await updateDoc(gameRef, {
        [`players.${newPlayerId}`]: newPlayer
      });

      console.log('✅ Joined game successfully');

      setCurrentGameId(gameCode);
      setPlayerName(name.trim());
      setPlayerId(newPlayerId);
      setPlayerBoard(board);
      setPlayerNames({});
      setLanguage(gameData.language);
      setView('player');
    } catch (err) {
      console.error('❌ Error joining game:', err);
      setError('Failed to join game: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePlayerProgress = async (names) => {
    if (!currentGameId || !playerId) return;

    try {
      const gameRef = doc(db, 'games', currentGameId);
      await updateDoc(gameRef, {
        [`players.${playerId}.names`]: names
      });
      console.log('✅ Progress updated');
    } catch (err) {
      console.error('❌ Error updating progress:', err);
    }
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

  const generateNewBoard = async () => {
    if (!currentGame || !playerId || !currentGameId) return;
    
    const newBoard = generateBoard(currentGame.language);
    const newNames = {};
    
    setPlayerBoard(newBoard);
    setPlayerNames(newNames);
    
    try {
      const gameRef = doc(db, 'games', currentGameId);
      await updateDoc(gameRef, {
        [`players.${playerId}.board`]: newBoard,
        [`players.${playerId}.names`]: newNames
      });
      console.log('✅ New board generated');
    } catch (err) {
      console.error('❌ Error generating new board:', err);
    }
  };

  const deleteGame = async () => {
    if (!currentGameId || !isAdmin) return;
    
    if (!window.confirm(translations[language].confirmDelete)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'games', currentGameId));
      console.log('✅ Game deleted');
      goBackToMenu();
    } catch (err) {
      console.error('❌ Error deleting game:', err);
      setError('Failed to delete game: ' + err.message);
    }
  };

  const goBackToMenu = () => {
    setView('menu');
    setCurrentGameId(null);
    setCurrentGame(null);
    setPlayerName('');
    setPlayerId(null);
    setIsAdmin(false);
    setError('');
  };

  const t = translations[language];

  // Loading state
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.signIn}</p>
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

            {error && (
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
                {isAdmin && (
                  <button
                    onClick={deleteGame}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {t.deleteGame}
                  </button>
                )}
                <button
                  onClick={goBackToMenu}
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
                onClick={goBackToMenu}
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