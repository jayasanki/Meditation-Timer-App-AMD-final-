 
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  getDoc,
  DocumentData 
} from 'firebase/firestore';
import { db } from '../config/firebase'
import { MeditationSession, User } from '../types'

export const meditationApi = {
  // Create a new meditation session
  async createSession(session: Omit<MeditationSession, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'meditationSessions'), {
        ...session,
        createdAt: Timestamp.now(),
        completedAt: session.completedAt ? Timestamp.now() : null
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create meditation session');
    }
  },
   // Get all sessions for a user
  async getSessions(userId: string): Promise<MeditationSession[]> {
    try {
      const q = query(
        collection(db, 'meditationSessions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
      return {
          id: doc.id,
          userId: data.userId,
          duration: data.duration,
          actualDuration: data.actualDuration,
          completed: data.completed,
          notes: data.notes,
          createdAt: data.createdAt.toDate().toISOString(),
          completedAt: data.completedAt?.toDate().toISOString()
        } as MeditationSession;
      });
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw new Error('Failed to fetch meditation sessions');
    }
  },

  // Get a single session by ID
  async getSession(sessionId: string): Promise<MeditationSession | null> {
    try {
      const sessionRef = doc(db, 'meditationSessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (sessionSnap.exists()) {
        const data = sessionSnap.data();
        return {
          id: sessionSnap.id,
          userId: data.userId,
          duration: data.duration,
          actualDuration: data.actualDuration,
          completed: data.completed,
          notes: data.notes,
          createdAt: data.createdAt.toDate().toISOString(),
          completedAt: data.completedAt?.toDate().toISOString()
        } as MeditationSession;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting session:', error);
      throw new Error('Failed to fetch meditation session');
    }
  },

 // Update a session
  async updateSession(sessionId: string, updates: Partial<MeditationSession>): Promise<void> {
    try {
      const sessionRef = doc(db, 'meditationSessions', sessionId);
      
      // Convert date strings back to Timestamp if needed
      const firestoreUpdates: any = { ...updates };
      
      if (updates.createdAt) {
        firestoreUpdates.createdAt = Timestamp.fromDate(new Date(updates.createdAt));
      }
      
      if (updates.completedAt) {
        firestoreUpdates.completedAt = Timestamp.fromDate(new Date(updates.completedAt));
      }
      
      await updateDoc(sessionRef, firestoreUpdates);
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update meditation session');
    }
  },
 
};

// Export for use in other parts of the application
export default meditationApi;