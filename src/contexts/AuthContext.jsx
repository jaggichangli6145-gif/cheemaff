import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

// ─── Demo Mode Users (localStorage-based, no Firebase needed) ───────────────
const ADMIN_ID   = '7814249224';
const ADMIN_PASS = 'cheema';

const DEFAULT_ADMIN = {
  id: 'admin-001',
  uid: 'admin-001',
  username: 'Admin Cheema',
  email: `${ADMIN_ID}@ffesports.com`,
  phone: ADMIN_ID,
  freeFireUid: 'FF-ADMIN-001',
  avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=admin`,
  balance: 99999,
  bonusBalance: 0,
  winningsBalance: 0,
  role: 'admin',
  isBlocked: false,
  stats: { matches: 0, wins: 0, kills: 0, earnings: 0 },
  createdAt: new Date().toISOString()
};

// Helpers
const getUsers  = () => JSON.parse(localStorage.getItem('ff_users')  || '[]');
const saveUsers = (users) => localStorage.setItem('ff_users', JSON.stringify(users));
const getSession = () => JSON.parse(localStorage.getItem('ff_session') || 'null');
const saveSession = (user) => localStorage.setItem('ff_session', JSON.stringify(user));
const clearSession = () => localStorage.removeItem('ff_session');

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData,    setUserData]    = useState(null);
  const [loading,     setLoading]     = useState(true);

  // Restore session on mount
  useEffect(() => {
    const session = getSession();
    if (session) {
      setCurrentUser(session);
      setUserData(session);
    }
    setLoading(false);
  }, []);

  // ── Email / Password Login ─────────────────────────────────────────────────
  const loginWithEmail = async (emailOrPhone, password) => {
    try {
      // Check admin credentials
      const isAdminLogin =
        (emailOrPhone === ADMIN_ID ||
         emailOrPhone === `${ADMIN_ID}@ffesports.com`) &&
        password === ADMIN_PASS;

      if (isAdminLogin) {
        saveSession(DEFAULT_ADMIN);
        setCurrentUser(DEFAULT_ADMIN);
        setUserData(DEFAULT_ADMIN);
        toast.success('Welcome Commander! Admin access granted 🛡️');
        return DEFAULT_ADMIN;
      }

      // Check registered users
      const users = getUsers();
      const user  = users.find(
        u => (u.email === emailOrPhone || u.phone === emailOrPhone) &&
             u.password === password
      );

      if (!user) {
        toast.error('Invalid credentials. Please check your ID or password.');
        throw new Error('Invalid credentials');
      }
      if (user.isBlocked) {
        toast.error('Your account has been suspended by administrators.');
        throw new Error('Account suspended');
      }

      const { password: _, ...safeUser } = user;
      saveSession(safeUser);
      setCurrentUser(safeUser);
      setUserData(safeUser);
      toast.success('Welcome back to the Arena! 🔥');
      return safeUser;
    } catch (error) {
      if (!error.message.includes('Invalid') && !error.message.includes('suspended')) {
        toast.error('Login failed. Please try again.');
      }
      throw error;
    }
  };

  // ── Email / Password Signup ────────────────────────────────────────────────
  const signupWithEmail = async (email, password, additionalData = {}) => {
    try {
      const users = getUsers();
      if (users.find(u => u.email === email)) {
        toast.error('An account with this email already exists.');
        throw new Error('Email already in use');
      }

      const newUser = {
        id: `user-${Date.now()}`,
        uid: `user-${Date.now()}`,
        username: additionalData.username || email.split('@')[0],
        email,
        password, // stored locally only for demo
        phone: additionalData.phone || '',
        freeFireUid: additionalData.freeFireUid || '',
        avatar: additionalData.avatar ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        balance: 50,
        bonusBalance: 50,
        winningsBalance: 0,
        role: 'user',
        isBlocked: false,
        stats: { matches: 0, wins: 0, kills: 0, earnings: 0 },
        createdAt: new Date().toISOString()
      };

      saveUsers([...users, newUser]);
      const { password: _, ...safeUser } = newUser;
      saveSession(safeUser);
      setCurrentUser(safeUser);
      setUserData(safeUser);
      toast.success('Account created! Welcome Bonus ₹50 added 🎉');
      return safeUser;
    } catch (error) {
      if (!error.message.includes('already')) {
        toast.error('Signup failed. Please try again.');
      }
      throw error;
    }
  };

  // ── Google Login (simulated demo) ─────────────────────────────────────────
  const loginWithGoogle = async () => {
    try {
      const demoGoogleUser = {
        id: `google-${Date.now()}`,
        uid: `google-${Date.now()}`,
        username: 'Google Player',
        email: 'googleplayer@gmail.com',
        phone: '',
        freeFireUid: '',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=google`,
        balance: 50,
        bonusBalance: 50,
        winningsBalance: 0,
        role: 'user',
        isBlocked: false,
        stats: { matches: 0, wins: 0, kills: 0, earnings: 0 },
        createdAt: new Date().toISOString()
      };

      // Check if already registered
      const users = getUsers();
      const existing = users.find(u => u.email === demoGoogleUser.email);
      const finalUser = existing || demoGoogleUser;

      if (!existing) saveUsers([...users, { ...demoGoogleUser, password: 'google' }]);

      saveSession(finalUser);
      setCurrentUser(finalUser);
      setUserData(finalUser);
      toast.success('Logged in with Google! 🔥');
      return finalUser;
    } catch (error) {
      toast.error('Google sign-in failed.');
      throw error;
    }
  };

  // ── Phone OTP (simulated) ──────────────────────────────────────────────────
  const sendPhoneOtp = async (phoneNumber) => {
    toast.success(`OTP sent to ${phoneNumber}! (Demo: use 123456)`);
    return { phoneNumber, demoOtp: '123456' };
  };

  const verifyPhoneOtp = async (confirmationResult, otpCode, extraInfo = {}) => {
    if (otpCode !== '123456' && otpCode !== confirmationResult.demoOtp) {
      toast.error('Invalid OTP. (Demo: use 123456)');
      throw new Error('Invalid OTP');
    }
    const phone = confirmationResult.phoneNumber;
    const users = getUsers();
    let user = users.find(u => u.phone === phone);
    if (!user) {
      user = {
        id: `phone-${Date.now()}`,
        uid: `phone-${Date.now()}`,
        username: extraInfo.username || `Player_${phone.slice(-4)}`,
        email: extraInfo.email || '',
        phone,
        freeFireUid: extraInfo.freeFireUid || '',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${phone}`,
        balance: 50, bonusBalance: 50, winningsBalance: 0,
        role: 'user', isBlocked: false,
        stats: { matches: 0, wins: 0, kills: 0, earnings: 0 },
        createdAt: new Date().toISOString()
      };
      saveUsers([...users, { ...user, password: 'phone' }]);
    }
    saveSession(user);
    setCurrentUser(user);
    setUserData(user);
    toast.success('Phone verified! Login successful. 🎮');
    return user;
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    clearSession();
    setCurrentUser(null);
    setUserData(null);
    toast.success('Logged out successfully.');
  };

  // ── Update Profile ─────────────────────────────────────────────────────────
  const updateUserProfile = async (updates) => {
    if (!currentUser) return;
    const updated = { ...userData, ...updates };
    const users   = getUsers();
    const idx     = users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      saveUsers(users);
    }
    saveSession(updated);
    setCurrentUser(updated);
    setUserData(updated);
    toast.success('Profile updated successfully!');
  };

  // ── Update Balance ─────────────────────────────────────────────────────────
  const updateBalance = async (amountDelta) => {
    if (!currentUser) return;
    const updated = { ...userData, balance: (userData.balance || 0) + amountDelta };
    const users   = getUsers();
    const idx     = users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
      users[idx].balance = updated.balance;
      saveUsers(users);
    }
    saveSession(updated);
    setCurrentUser(updated);
    setUserData(updated);
  };

  // ── Admin flag ─────────────────────────────────────────────────────────────
  const isAdmin = userData?.role === 'admin';

  const value = {
    currentUser,
    userData,
    loading,
    isAdmin,
    signupWithEmail,
    loginWithEmail,
    loginWithGoogle,
    sendPhoneOtp,
    verifyPhoneOtp,
    logout,
    updateUserProfile,
    updateBalance
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
