import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { verifyUserAdminStatus, getUserProfile, saveUserProfile } from '../services/dbService';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isEmailVerified: boolean;
  loading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshEmailVerification: () => Promise<boolean>;
  sendResetPasswordEmail: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateCustomerProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // In Firebase Auth, Google accounts are automatically email-verified
        const isGoogle = user.providerData.some((p) => p.providerId === 'google.com');
        setIsEmailVerified(user.emailVerified || isGoogle);

        try {
          // Check Admin status
          const adminCheck = await verifyUserAdminStatus(user);
          setIsAdmin(adminCheck);

          // Fetch or initialize customer profile in Firestore
          let profile = await getUserProfile(user.uid);
          if (!profile) {
            profile = {
              userId: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Valued Customer',
              createdAt: new Date().toISOString(),
            };
            await saveUserProfile(profile);
          }
          setUserProfile(profile);
        } catch (err) {
          console.warn('Profile/Admin check note:', err);
        }
      } else {
        setIsAdmin(false);
        setIsEmailVerified(false);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      const adminCheck = await verifyUserAdminStatus(user);
      setIsAdmin(adminCheck);
      setIsEmailVerified(true);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      let message = 'Unable to sign in with Google. Please check your browser popup settings.';
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in popup was closed before completing.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        message = 'Sign-in was cancelled.';
      } else if (err.message) {
        message = err.message;
      }
      setAuthError(message);
      throw new Error(message);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const user = res.user;
      setIsEmailVerified(user.emailVerified);
      const adminCheck = await verifyUserAdminStatus(user);
      setIsAdmin(adminCheck);
    } catch (err: any) {
      console.error('Email sign-in failed:', err);
      let msg = 'Failed to sign in. Please verify your email and password.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. Please try again or reset your password.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please reset your password or try again later.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'The email address format is invalid.';
      }
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    setAuthError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const user = res.user;

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: name.trim() });

      // Send standard Firebase email verification link
      await sendEmailVerification(user);

      // Create profile document
      const newProfile: UserProfile = {
        userId: user.uid,
        email: user.email || email.trim(),
        displayName: name.trim(),
        createdAt: new Date().toISOString(),
      };
      await saveUserProfile(newProfile);
      setUserProfile(newProfile);
      setIsEmailVerified(false);
    } catch (err: any) {
      console.error('Registration failed:', err);
      let msg = 'Registration failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email address is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'The password is too weak. Please use at least 6 characters with a combination of letters and numbers.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error('No user is currently signed in');
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (err: any) {
      if (err.code === 'auth/too-many-requests') {
        throw new Error('Verification email was recently sent. Please wait a minute before requesting another.');
      }
      throw err;
    }
  };

  const refreshEmailVerification = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    const verified = auth.currentUser.emailVerified;
    setIsEmailVerified(verified);
    return verified;
  };

  const sendResetPasswordEmail = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      let msg = 'Could not send password reset email.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
    setIsAdmin(false);
    setIsEmailVerified(false);
  };

  const updateCustomerProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('Not authenticated');
    await saveUserProfile({
      ...userProfile,
      ...data,
      userId: currentUser.uid,
    });
    setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        isEmailVerified,
        loading,
        authError,
        setAuthError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendVerificationEmail,
        refreshEmailVerification,
        sendResetPasswordEmail,
        signOutUser,
        updateCustomerProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
