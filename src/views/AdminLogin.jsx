import React, { useState } from 'react';

const AdminLogin = ({ 
  translations,
  language,
  loading,
  error,
  onLogin,
  onBack
}) => {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const t = translations[language] || translations.en;

  const handleSubmit = () => {
    onLogin(adminEmail, adminPassword);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && adminEmail && adminPassword) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-indigo-600">{t.adminLogin}</h1>
            <button
              onClick={onBack}
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

          <div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">{t.email}</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">{t.password}</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
                onKeyPress={handleKeyPress}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-400"
            >
              {loading ? t.loading : t.login}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;