import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth, googleProvider } from "./config";
import { createUserProfile, getUserProfile } from "./firestore";

const toBatchYear = (value) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
};

/**
 * Register a new user with email and password.
 * Firebase signs the new account in automatically; we sign it straight back out
 * so nobody reaches the dashboard before verifying their email.
 */
export const registerWithEmail = async (email, password, username, batchyear) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: username });
    await sendEmailVerification(user);

    await createUserProfile(user.uid, {
      email: user.email,
      username,
      batchyear: toBatchYear(batchyear),
      emailVerified: false,
      is_member: false,
      userRole: "User",
      terms_confirmed: true,
      following: [],
    });

    await signOut(auth);

    return {
      success: true,
      user,
      message: "Registration successful! Please verify your email, then sign in.",
    };
  } catch (error) {
    console.error("Registration error:", error);
    // If the account was created but a later step failed, don't leave it signed in.
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      await signOut(auth).catch(() => {});
    }
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code),
    };
  }
};

/**
 * Sign in with email and password. Unverified accounts are signed back out.
 */
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      await signOut(auth);
      return {
        success: false,
        error: "email-not-verified",
        message: "Please verify your email before logging in.",
      };
    }

    const userProfile = await getUserProfile(user.uid);

    return {
      success: true,
      user,
      userProfile,
      message: "Welcome back!",
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code),
    };
  }
};

/**
 * Re-send the verification email for an account that hasn't been verified yet.
 * Needs the password because Firebase only sends it to a signed-in user.
 */
export const resendVerificationEmail = async (email, password) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    if (user.emailVerified) {
      await signOut(auth);
      return { success: true, message: "Your email is already verified. You can sign in." };
    }
    await sendEmailVerification(user);
    await signOut(auth);
    return { success: true, message: "Verification email sent. Please check your inbox." };
  } catch (error) {
    console.error("Resend verification error:", error);
    return { success: false, error: error.code, message: getErrorMessage(error.code) };
  }
};

/**
 * Sign in with Google. Creates a profile on first sign-in.
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    let userProfile = await getUserProfile(user.uid);
    const isNewUser = !userProfile;

    if (isNewUser) {
      await createUserProfile(user.uid, {
        email: user.email,
        username: user.displayName || user.email.split("@")[0],
        emailVerified: true,
        is_member: false,
        userRole: "User",
        photoURL: user.photoURL,
        batchyear: null,
        terms_confirmed: false,
        following: [],
      });
      userProfile = await getUserProfile(user.uid);
    }

    return {
      success: true,
      user,
      userProfile,
      isNewUser,
      message: isNewUser ? "Welcome to the BAA community!" : "Welcome back!",
    };
  } catch (error) {
    console.error("Google login error:", error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code),
    };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true, message: "Logged out successfully!" };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: error.code,
      message: "Failed to logout. Please try again.",
    };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Password reset email sent! Check your inbox.",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code),
    };
  }
};

/**
 * Change the signed-in user's password (email/password accounts only).
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("No user logged in");
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);

    return {
      success: true,
      message: "Password changed successfully!",
    };
  } catch (error) {
    console.error("Change password error:", error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code),
    };
  }
};

/** True when the user signed in with email/password (so a password can be changed). */
export const hasPasswordProvider = (user) =>
  !!user?.providerData?.some((p) => p.providerId === "password");

export const getCurrentUser = () => auth.currentUser;

const getErrorMessage = (errorCode) => {
  const errorMessages = {
    "auth/email-already-in-use": "This email is already registered.",
    "auth/invalid-email": "Invalid email address.",
    "auth/operation-not-allowed": "Operation not allowed.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Invalid credentials. Please check your email and password.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/requires-recent-login": "Please sign in again and retry.",
    "email-not-verified": "Please verify your email before logging in.",
    "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
    "auth/cancelled-popup-request": "Sign-in cancelled.",
    "auth/popup-blocked": "Your browser blocked the sign-in popup. Please allow popups and retry.",
  };

  return errorMessages[errorCode] || "An error occurred. Please try again.";
};

const authApi = {
  registerWithEmail,
  loginWithEmail,
  resendVerificationEmail,
  loginWithGoogle,
  logout,
  resetPassword,
  changePassword,
  hasPasswordProvider,
  getCurrentUser,
};

export default authApi;
