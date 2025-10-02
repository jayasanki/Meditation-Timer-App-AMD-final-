import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { User } from '@/types';

export const authService = {
  // Register new user
  async register(email: string, password: string, name: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      if (name) {
        await updateProfile(user, { displayName: name });
      }

      return {
        id: user.uid,
        email: user.email!,
        name: name || user.email?.split('@')[0] || 'User',
        createdAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
      }
      
      throw new Error(errorMessage);
    }
  },

   // Login user
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      return {
        id: user.uid,
        email: user.email!,
        name: user.displayName || user.email?.split('@')[0] || 'User',
        createdAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
      }
      
      throw new Error(errorMessage);
    }
  },
 // Logout user
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error('Logout failed. Please try again.');
    }
  },

// Get current user
  getCurrentUser(): User | null {
    const user = auth.currentUser;
    if (!user) return null;

    return {
      id: user.uid,
      email: user.email!,
      name: user.displayName || user.email?.split('@')[0] || 'User',
      createdAt: new Date().toISOString()
    };
  },

// Send password reset email
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
      }
      
      throw new Error(errorMessage);
    }
  },
  // Update user profile
  async updateProfile(updates: { displayName?: string; photoURL?: string }): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      await updateProfile(user, updates);
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile. Please try again.');
    }
  },
 // Update user email
  async updateUserEmail(newEmail: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      await updateEmail(user, newEmail);
    } catch (error: any) {
      console.error('Email update error:', error);
      
      let errorMessage = 'Failed to update email. Please try again.';
      
      switch (error.code) {
        case 'auth/requires-recent-login':
          errorMessage = 'Please log in again to update your email.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already in use.';
          break;
      }
      
      throw new Error(errorMessage);
    }
  },
 // Update user password
  async updateUserPassword(newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      await updatePassword(user, newPassword);
    } catch (error: any) {
      console.error('Password update error:', error);
      
      let errorMessage = 'Failed to update password. Please try again.';
      
      switch (error.code) {
        case 'auth/requires-recent-login':
          errorMessage = 'Please log in again to update your password.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
      }
      
      throw new Error(errorMessage);
    }
  },
  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!auth.currentUser;
  },

  // Get auth state changes (for real-time auth state monitoring)
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          createdAt: new Date().toISOString()
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  },
   // Get current Firebase user (for advanced operations)
  getFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
  }

};

// Export for use in other parts of the application
export default authService;