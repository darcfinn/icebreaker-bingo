import { signInWithEmailAndPassword, signOut, signInAnonymously } from 'firebase/auth';
import { auth } from '../lib/firebase';

/**
 * Authentication Service
 * 
 * Handles all authentication operations:
 * - Admin login with email/password
 * - Anonymous player authentication
 * - Logout
 */

/**
 * Login as admin with email and password
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<UserCredential>} User credential object
 */
export const loginAdmin = async (email, password) => {
  console.log('🔐 Attempting admin login:', email);
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  console.log('✅ Admin logged in:', userCredential.user.email);
  return userCredential;
};

/**
 * Sign in anonymously as a player
 * @returns {Promise<UserCredential>} User credential object
 */
export const loginAnonymous = async () => {
  console.log('🔐 Signing in anonymously');
  const userCredential = await signInAnonymously(auth);
  console.log('✅ Anonymous sign-in successful');
  return userCredential;
};

/**
 * Logout current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  console.log('👋 Logging out');
  await signOut(auth);
  console.log('✅ Logged out');
};