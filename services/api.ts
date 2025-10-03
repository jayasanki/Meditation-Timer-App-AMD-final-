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
import { db } from '../config/firebase';
import { MeditationSession, User } from '../types';

export const meditationApi = {
  // Create a new meditation session
  async createSession(session: Omit<MeditationSession, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'meditationSessions'), {
        ...session,
        createdAt: Timestamp.now(),
        completedAt: session.completedAt ? Timestamp.fromDate(new Date(session.completedAt)) : null
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
      
      const querySnapshot = await getDocs(q); // Added missing getDocs call
      
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
      
      // Remove id and userId from updates as they shouldn't be changed
      delete firestoreUpdates.id;
      delete firestoreUpdates.userId;
      
      if (updates.createdAt) {
        firestoreUpdates.createdAt = Timestamp.fromDate(new Date(updates.createdAt));
      }
      
      if (updates.completedAt) {
        firestoreUpdates.completedAt = Timestamp.fromDate(new Date(updates.completedAt));
      } else if (updates.completedAt === null) {
        firestoreUpdates.completedAt = null;
      }
      
      await updateDoc(sessionRef, firestoreUpdates);
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update meditation session');
    }
  },

  // Delete a session
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'meditationSessions', sessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error('Failed to delete meditation session');
    }
  },

  // Get user statistics
  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    totalMinutes: number;
    averageSessionTime: number;
    completedSessions: number;
  }> {
    try {
      const sessions = await this.getSessions(userId);
      const completedSessions = sessions.filter(session => session.completed);
      
      const totalSessions = completedSessions.length;
      const totalMinutes = Math.floor(
        completedSessions.reduce((sum, session) => sum + session.actualDuration, 0) / 60
      );
      const averageSessionTime = totalSessions > 0 ? Math.floor(totalMinutes / totalSessions) : 0;

      return {
        totalSessions,
        totalMinutes,
        averageSessionTime,
        completedSessions: totalSessions
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw new Error('Failed to fetch user statistics');
    }
  },

  // Get recent sessions (last 7 days)
  async getRecentSessions(userId: string): Promise<MeditationSession[]> {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const q = query(
        collection(db, 'meditationSessions'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(oneWeekAgo)),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
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
      console.error('Error getting recent sessions:', error);
      throw new Error('Failed to fetch recent sessions');
    }
  },

  // Get sessions by date range
  async getSessionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<MeditationSession[]> {
    try {
      const q = query(
        collection(db, 'meditationSessions'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
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
      console.error('Error getting sessions by date range:', error);
      throw new Error('Failed to fetch sessions by date range');
    }
  },

  // Get completed sessions only
  async getCompletedSessions(userId: string): Promise<MeditationSession[]> {
    try {
      const q = query(
        collection(db, 'meditationSessions'),
        where('userId', '==', userId),
        where('completed', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
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
      console.error('Error getting completed sessions:', error);
      throw new Error('Failed to fetch completed sessions');
    }
  },

  // Get sessions count by duration
  async getSessionsCountByDuration(userId: string): Promise<Record<number, number>> {
    try {
      const sessions = await this.getSessions(userId);
      const completedSessions = sessions.filter(session => session.completed);
      
      const durationCount: Record<number, number> = {};
      completedSessions.forEach(session => {
        const duration = session.duration;
        durationCount[duration] = (durationCount[duration] || 0) + 1;
      });
      
      return durationCount;
    } catch (error) {
      console.error('Error getting sessions count by duration:', error);
      throw new Error('Failed to fetch sessions count by duration');
    }
  }

};

// Export for use in other parts of the application
export default meditationApi;