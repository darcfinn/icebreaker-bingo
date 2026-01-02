import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import * as authService from '../services/authService';

/**
 * Custom hook for authentication state management
 * 
 * Handles:
 * - Current user state
 * - Admin status detection
 * - Login/logout operations
 * - Auth state monitoring
 */
export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Auth state changed:', user?.email || user?.uid || 'none');
      setCurrentUser(user);
      setAuthReady(true);
      
      if (user?.email) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Login as admin
   */
  const loginAdmin = async (email, password) => {
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await authService.loginAdmin(email, password);
      return { success: true, user: userCredential.user };
    } catch (err) {
      console.error('❌ Login error:', err.code);
      
      let errorMessage = 'Login failed';
      if (err.code === 'auth/user-not-found') errorMessage = 'No account found with this email';
      else if (err.code === 'auth/wrong-password') errorMessage = 'Incorrect password';
      else if (err.code === 'auth/invalid-email') errorMessage = 'Invalid email format';
      else if (err.code === 'auth/too-many-requests') errorMessage = 'Too many attempts. Try again later';
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login anonymously (for players)
   */
  const loginAnonymous = async () => {
    try {
      await authService.loginAnonymous();
      return { success: true };
    } catch (err) {
      console.error('❌ Anonymous login error:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    try {
      await authService.logout();
      setIsAdmin(false);
      return { success: true };
    } catch (err) {
      console.error('❌ Logout error:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    currentUser,
    isAdmin,
    authReady,
    loading,
    error,
    loginAdmin,
    loginAnonymous,
    logout,
    setError
  };
};