 
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
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString(),
        completedAt: doc.data().completedAt?.toDate().toISOString()
      })) as MeditationSession[];
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw error;
    }
  },


 
};

// Export for use in other parts of the application
export default meditationApi;