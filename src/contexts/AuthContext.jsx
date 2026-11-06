import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync Firebase Auth user and Firestore user profile
  useEffect(() => {
    let unsubscribeUserDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userRef = doc(db, 'users', user.uid);

        // Real-time listener for current user document
        unsubscribeUserDoc = onSnapshot(userRef, async (snapshot) => {
          if (snapshot.exists()) {
            setUserData({ id: snapshot.id, ...snapshot.data() });
          } else {
            // First time or missing doc (e.g., Google OAuth login)
            const defaultData = {
              uid: user.uid,
              username: user.displayName || user.email?.split('@')[0] || `Warrior_${user.uid.slice(0, 5)}`,
              email: user.email || '',
              phone: user.phoneNumber || '',
              freeFireUid: '',
              avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
              balance: 50, // Welcome signup bonus
              bonusBalance: 50,
              winningsBalance: 0,
              role: user.email === 'admin@ffesports.com' ? 'admin' : 'user',
              isBlocked: false,
              stats: {
                matches: 0,
                wins: 0,
                kills: 0,
                earnings: 0
              },
              createdAt: serverTimestamp()
            };

            try {
              await setDoc(userRef, defaultData);
              setUserData({ id: user.uid, ...defaultData });
            } catch (err) {
              console.error("Error creating user profile in Firestore:", err);
              // Fallback local representation
              setUserData({ id: user.uid, ...defaultData });
            }
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore user snapshot error:", error);
          setLoading(false);
        });

      } else {
        setCurrentUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  // Email/Password Signup
  const signupWithEmail = async (email, password, additionalData = {}) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      if (additionalData.username) {
        await updateProfile(user, {
          displayName: additionalData.username,
          photoURL: additionalData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`
        });
      }

      const userProfile = {
        uid: user.uid,
        username: additionalData.username || email.split('@')[0],
        email: email,
        phone: additionalData.phone || '',
        freeFireUid: additionalData.freeFireUid || '',
        avatar: additionalData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        balance: 50,
        bonusBalance: 50,
        winningsBalance: 0,
        role: email.toLowerCase() === 'admin@ffesports.com' ? 'admin' : 'user',
        isBlocked: false,
        stats: {
          matches: 0,
          wins: 0,
          kills: 0,
          earnings: 0
        },
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      setUserData({ id: user.uid, ...userProfile });
      toast.success('Account created successfully! Welcome Bonus ₹50 added.');
      return user;
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || 'Failed to create account.');
      throw error;
    }
  };

  // Email/Password Login
  const loginWithEmail = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Check if user is blocked
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (userDoc.exists() && userDoc.data().isBlocked) {
        await signOut(auth);
        throw new Error('Your account has been suspended by administrators.');
      }
      toast.success('Welcome back to the Arena!');
      return cred.user;
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || 'Invalid email or password.');
      throw error;
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      toast.success(`Logged in as ${cred.user.displayName || 'Warrior'}`);
      return cred.user;
    } catch (error) {
      console.error("Google login error:", error);
      toast.error(error.message || 'Google sign-in failed.');
      throw error;
    }
  };

  // Setup Phone Recaptcha
  const setupRecaptcha = (elementId = 'recaptcha-container') => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          toast.error('reCAPTCHA expired. Please retry.');
        }
      });
    }
    return window.recaptchaVerifier;
  };

  // Send Phone OTP
  const sendPhoneOtp = async (phoneNumber) => {
    try {
      const verifier = setupRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      toast.success('OTP sent to your phone number!');
      return confirmationResult;
    } catch (error) {
      console.error("Phone OTP send error:", error);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      toast.error(error.message || 'Failed to send OTP.');
      throw error;
    }
  };

  // Verify Phone OTP
  const verifyPhoneOtp = async (confirmationResult, otpCode, extraInfo = {}) => {
    try {
      const result = await confirmationResult.confirm(otpCode);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const userProfile = {
          uid: user.uid,
          username: extraInfo.username || `Player_${user.phoneNumber?.slice(-4)}`,
          email: extraInfo.email || '',
          phone: user.phoneNumber,
          freeFireUid: extraInfo.freeFireUid || '',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
          balance: 50,
          bonusBalance: 50,
          winningsBalance: 0,
          role: 'user',
          isBlocked: false,
          stats: { matches: 0, wins: 0, kills: 0, earnings: 0 },
          createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', user.uid), userProfile);
        setUserData({ id: user.uid, ...userProfile });
      }
      toast.success('Phone verified! Login successful.');
      return user;
    } catch (error) {
      console.error("Verify OTP error:", error);
      toast.error(error.message || 'Invalid verification code.');
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserData(null);
      toast.success('Logged out successfully.');
    } catch (error) {
      toast.error('Failed to log out.');
    }
  };

  // Update Profile
  const updateUserProfile = async (updates) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, updates);
      setUserData(prev => ({ ...prev, ...updates }));
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error('Failed to update profile.');
      throw error;
    }
  };

  // Deduct/Add Balance
  const updateBalance = async (amountDelta, reason = 'Adjustment') => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        balance: increment(amountDelta)
      });
    } catch (error) {
      console.error("Balance update error:", error);
      throw error;
    }
  };

  const isAdmin = userData?.role === 'admin' || currentUser?.email === 'admin@ffesports.com';

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
