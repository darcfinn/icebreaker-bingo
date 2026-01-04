import React from 'react';
import { Globe, User, LogIn, Users, LogOut } from 'lucide-react';

const LandingPage = ({ 
  currentUser, 
  isAdmin, 
  language, 
  translations,
  onNavigate,
  onLanguageToggle,
  onAdminLogout
}) => {
  const t = translations[language] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* User Status Bar */}
        {currentUser && currentUser.email && (
          <div className="mb-6 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 w-3 h-3 rounded-full"></div>
                <span>Logged in as: <strong>{currentUser.email}</strong></span>
              </div>
              <button
                onClick={onAdminLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span className="font-medium">{t.logout}</span>
              </button>
            </div>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">{t.appTitle}</h1>
          <p className="text-2xl text-indigo-100">{t.tagline}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Admin Login Card */}
          <div 
            onClick={() => {
              if (isAdmin) {
                onNavigate('adminDashboard');
              } else {
                onNavigate('adminLogin');
              }
            }}
            className="bg-white rounded-2xl shadow-2xl p-8 cursor-pointer transform transition-all hover:scale-105 hover:shadow-3xl"
          >
            <div className="text-center">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                {isAdmin ? <User size={40} className="text-indigo-600" /> : <LogIn size={40} className="text-indigo-600" /> }
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {isAdmin ? 'Admin Dashboard' : t.adminLogin}
              </h2>
              <p className="text-gray-600">
                {isAdmin ? 'Manage your games' : 'Create and manage games'}
              </p>
            </div>
          </div>

          {/* Player Join Card */}
          <div 
            onClick={() => onNavigate('playerJoin')}
            className="bg-white rounded-2xl shadow-2xl p-8 cursor-pointer transform transition-all hover:scale-105 hover:shadow-3xl"
          >
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{t.participate}</h2>
              <p className="text-gray-600">Join a game with code</p>
            </div>
          </div>
        </div>

        {/* Language Toggle */}
        <div className="text-center mt-8">
          <button
            onClick={onLanguageToggle}
            className="flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors mx-auto"
          >
            <Globe size={20} />
            <span className="font-medium">{language === 'en' ? 'Norsk' : 'English'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;