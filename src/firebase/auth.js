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
  reauthenticateWithCredential
} from "firebase/auth";
import { auth, googleProvider } from "./config";
import { createUserProfile, getUserProfile } from "./firestore";

/**
 * Register new user with email and password
 */
export const registerWithEmail = async (email, password, username, batchyear) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName: username });

    // Send verification email
    await sendEmailVerification(user);

    // Create user profile in Firestore
    await createUserProfile(user.uid, {
      email: user.email,
      username: username,
      batchyear: batchyear,
      createdAt: new Date().toISOString(),
      emailVerified: false,
      is_member: false,
      userRole: "User",
      terms_confirmed: true
    });

    return {
      success: true,
      user: user,
      message: "Registration successful! Please verify your email."
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code)
    };
  }
};

/**
 * Sign in with email and password
 */
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if email is verified
    if (!user.emailVerified) {
      await signOut(auth);
      return {
        success: false,
        error: "email-not-verified",
        message: "Please verify your email before logging in."
      };
    }

    // Get user profile to check membership status
    const userProfile = await getUserProfile(user.uid);

    return {
      success: true,
      user: user,
      userProfile: userProfile,
      message: "Login successful!"
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code)
    };
  }
};

/**
 * Sign in with Google
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user profile exists, if not create one
    let userProfile = await getUserProfile(user.uid);
    
    if (!userProfile) {
      // Create profile for new Google user
      await createUserProfile(user.uid, {
        email: user.email,
        username: user.displayName || user.email.split('@')[0],
        createdAt: new Date().toISOString(),
        emailVerified: true,
        is_member: false,
        userRole: "User",
        photoURL: user.photoURL,
        batchyear: null,
        terms_confirmed: false
      });
      userProfile = await getUserProfile(user.uid);
    }

    return {
      success: true,
      user: user,
      userProfile: userProfile,
      isNewUser: !userProfile,
      message: "Login successful!"
    };
  } catch (error) {
    console.error("Google login error:", error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code)
    };
  }
};

/**
 * Sign out current user
 */
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true, message: "Logged out successfully!" };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: error.code,
      message: "Failed to logout. Please try again."
    };
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Password reset email sent! Check your inbox."
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code)
    };
  }
};

/**
 * Change user password
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("No user logged in");
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);

    return {
      success: true,
      message: "Password changed successfully!"
    };
  } catch (error) {
    console.error("Change password error:", error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code)
    };
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Get user error messages
 */
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
    "email-not-verified": "Please verify your email before logging in.",
    "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
    "auth/cancelled-popup-request": "Sign-in cancelled.",
  };

  return errorMessages[errorCode] || "An error occurred. Please try again.";
};

export default {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
  changePassword,
  getCurrentUser
};
