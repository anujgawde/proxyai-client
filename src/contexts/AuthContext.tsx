"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { authService } from "@/api/auth";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to set session cookie
  const setSessionCookie = async (user: User | null) => {
    if (user) {
      try {
        const token = await user.getIdToken();
        // Set cookie with the token
        // Expires in 1 hour (3600 seconds)
        document.cookie = `__session=${token}; path=/; max-age=3600; samesite=strict; secure`;
      } catch (error) {
        console.error("Error setting session cookie:", error);
      }
    } else {
      // Remove cookie on logout
      document.cookie =
        "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict";
    }
  };

  const signUp = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        photoURL: user.photoURL,
        metadata: user.metadata,
        firebaseUid: user.uid,
        emailVerified: user.emailVerified,
        authProvider: user.providerData[0]?.providerId || "firebase",
      };
      await authService.signUp(userData);

      // Set session cookie after signup
      await setSessionCookie(user);
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);

      // Set session cookie after signin
      await setSessionCookie(response.user);
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);

      console.log("Google sign-in user:", user);
      let firstName = "";
      let lastName = "";

      if (user.displayName) {
        const displayNameParts = user.displayName.split(" ");
        firstName = displayNameParts[0];
        lastName = displayNameParts.length > 1 ? displayNameParts[1] : "";
      }

      const userData = {
        firstName,
        lastName,
        email: user.email || "",
        photoURL: user.photoURL,
        metadata: user.metadata,
        firebaseUid: user.uid,
        emailVerified: user.emailVerified,
        authProvider: user.providerData[0]?.providerId || "firebase",
      };

      const response = await authService.googleSignIn(userData);

      console.log(response);

      // Set session cookie after Google signin
      await setSessionCookie(user);
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Remove session cookie on logout
      await setSessionCookie(null);
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      // Set or remove session cookie based on auth state
      await setSessionCookie(user);

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Helper function to convert Firebase error codes to display messages
function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/invalid-credential":
      return "Please enter valid credentials.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completion.";
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    default:
      return "An error occurred during authentication. Please try again.";
  }
}
