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

  

};

// Export for use in other parts of the application
export default authService;