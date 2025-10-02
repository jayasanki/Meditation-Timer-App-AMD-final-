import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
  ActivityIndicator,
  SectionList
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { MeditationSession } from '@/types';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function HistoryScreen() {
  const { sessions, deleteSession, refreshSessions, loading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'duration'>('date');

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSessions();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh sessions');
    } finally {
      setRefreshing(false);
    }
  };

  // Filter and sort sessions
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = sessions;
    
    // Apply filter
    if (filter === 'completed') {
      filtered = sessions.filter(session => session.completed);
    } else if (filter === 'incomplete') {
      filtered = sessions.filter(session => !session.completed);
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.actualDuration - a.actualDuration;
      }
    });
    
    return filtered;
  }, [sessions, filter, sortBy]);

  // Group sessions by date for section list
  const groupedSessions = useMemo(() => {
    const groups: { [key: string]: MeditationSession[] } = {};
    
    filteredAndSortedSessions.forEach(session => {
      const date = new Date(session.completedAt || session.createdAt);
      const dateKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
    });
    
    return Object.entries(groups).map(([title, data]) => ({
      title,
      data
    }));
  }, [filteredAndSortedSessions]);

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteSession(sessionId)
        }
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const formatDetailedDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const getTotalStats = () => {
    const completedSessions = sessions.filter(session => session.completed);
    const totalSessions = completedSessions.length;
    const totalTime = completedSessions.reduce((sum, session) => sum + session.actualDuration, 0);
    const averageTime = totalSessions > 0 ? Math.floor(totalTime / totalSessions) : 0;
    
    return {
      totalSessions,
      totalTime,
      averageTime: formatDuration(averageTime)
    };
  };

  const stats = getTotalStats();

  const renderSessionItem = ({ item }: { item: MeditationSession }) => (
    <TouchableOpacity 
      style={styles.sessionItem}
      onPress={() => setSelectedSession(item)}
    >
      <View style={styles.sessionIcon}>
        <Icon 
          name={item.completed ? 'check-circle' : 'timer'} 
          size={24} 
          color={item.completed ? '#4CAF50' : '#FF9800'} 
        />
      </View>
      
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionDuration}>
          {formatDuration(item.actualDuration)}
        </Text>
        <Text style={styles.sessionDate}>
          {formatDate(item.completedAt || item.createdAt)}
        </Text>
        {item.notes && (
          <Text style={styles.sessionNotes} numberOfLines={1}>
            {item.notes}
          </Text>
        )}
      </View>
      
      <View style={styles.sessionActions}>
        <View style={[
          styles.statusBadge,
          item.completed ? styles.completedBadge : styles.incompleteBadge
        ]}>
          <Text style={[
            styles.statusText,
            item.completed ? styles.completedText : styles.incompleteText
          ]}>
            {item.completed ? 'Completed' : 'Incomplete'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.deleteIconButton}
          onPress={() => handleDeleteSession(item.id)}
        >
          <Icon name="delete-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  if (loading && sessions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading your meditation history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Meditation History</Text>
        <Text style={styles.subtitle}>
          {sessions.length} total sessions • {stats.totalSessions} completed
        </Text>
      </View>

      {/* Stats Overview */}
      {sessions.length > 0 && (
        <View style={styles.statsOverview}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatDuration(stats.totalTime)}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.averageTime}</Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
        </View>
      )}

      {/* Filter and Sort Controls */}
      {sessions.length > 0 && (
        <View style={styles.controls}>
          <View style={styles.filterContainer}>
            <Text style={styles.controlLabel}>Filter:</Text>
            <View style={styles.filterButtons}>
              {(['all', 'completed', 'incomplete'] as const).map((filterType) => (
                <TouchableOpacity
                  key={filterType}
                  style={[
                    styles.filterButton,
                    filter === filterType && styles.filterButtonActive
                  ]}
                  onPress={() => setFilter(filterType)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filter === filterType && styles.filterButtonTextActive
                  ]}>
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.sortContainer}>
            <Text style={styles.controlLabel}>Sort by:</Text>
            <View style={styles.sortButtons}>
              {(['date', 'duration'] as const).map((sortType) => (
                <TouchableOpacity
                  key={sortType}
                  style={[
                    styles.sortButton,
                    sortBy === sortType && styles.sortButtonActive
                  ]}
                  onPress={() => setSortBy(sortType)}
                >
                  <Text style={[
                    styles.sortButtonText,
                    sortBy === sortType && styles.sortButtonTextActive
                  ]}>
                    {sortType.charAt(0).toUpperCase() + sortType.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Sessions List */}
      {filteredAndSortedSessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="history" size={64} color="#ccc" />
          <Text style={styles.emptyStateTitle}>
            {sessions.length === 0 ? 'No meditation sessions yet' : 'No sessions match your filter'}
          </Text>
          <Text style={styles.emptyStateText}>
            {sessions.length === 0 
              ? 'Start your first meditation session from the home screen!'
              : 'Try changing your filter settings to see more sessions.'
            }
          </Text>
        </View>
      ) : (
        <SectionList
          sections={groupedSessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSessionItem}
          renderSectionHeader={renderSectionHeader}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Session Detail Modal */}
      <Modal
        visible={!!selectedSession}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedSession(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Session Details</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedSession(null)}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedSession && (
                <View style={styles.modalInfo}>
                  <View style={styles.detailRow}>
                    <Icon name="access-time" size={20} color="#4A6572" />
                    <View style={styles.detailText}>
                      <Text style={styles.detailLabel}>Duration</Text>
                      <Text style={styles.detailValue}>
                        {formatDuration(selectedSession.actualDuration)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Icon name="event" size={20} color="#4A6572" />
                    <View style={styles.detailText}>
                      <Text style={styles.detailLabel}>Date & Time</Text>
                      <Text style={styles.detailValue}>
                        {formatDetailedDate(selectedSession.completedAt || selectedSession.createdAt)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Icon name="flag" size={20} color="#4A6572" />
                    <View style={styles.detailText}>
                      <Text style={styles.detailLabel}>Status</Text>
                      <View style={[
                        styles.statusBadge,
                        selectedSession.completed ? styles.completedBadge : styles.incompleteBadge
                      ]}>
                        <Text style={[
                          styles.statusText,
                          selectedSession.completed ? styles.completedText : styles.incompleteText
                        ]}>
                          {selectedSession.completed ? 'Completed' : 'Incomplete'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {selectedSession.notes && (
                    <View style={styles.detailRow}>
                      <Icon name="notes" size={20} color="#4A6572" />
                      <View style={styles.detailText}>
                        <Text style={styles.detailLabel}>Notes</Text>
                        <Text style={styles.notesText}>
                          {selectedSession.notes}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteModalButton]}
                onPress={() => {
                  if (selectedSession) {
                    handleDeleteSession(selectedSession.id);
                    setSelectedSession(null);
                  }
                }}
              >
                <Icon name="delete" size={20} color="white" />
                <Text style={styles.deleteModalButtonText}>Delete Session</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.closeModalButton]}
                onPress={() => setSelectedSession(null)}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: 'white'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#666'
  },
  statsOverview: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666'
  },
  controls: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  filterContainer: {
    marginBottom: 12
  },
  sortContainer: {
    // Additional styles if needed
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A6572',
    marginBottom: 8
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  filterButtonActive: {
    backgroundColor: '#4A6572',
    borderColor: '#4A6572'
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666'
  },
  filterButtonTextActive: {
    color: 'white'
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  sortButtonActive: {
    backgroundColor: '#4A6572',
    borderColor: '#4A6572'
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666'
  },
  sortButtonTextActive: {
    color: 'white'
  },
  listContent: {
    padding: 16
  },
  sectionHeader: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A6572'
  },
  sessionItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  sessionIcon: {
    marginRight: 12
  },
  sessionInfo: {
    flex: 1
  },
  sessionDuration: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 2
  },
  sessionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  sessionNotes: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic'
  },
  sessionActions: {
    alignItems: 'flex-end',
    gap: 8
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  completedBadge: {
    backgroundColor: '#e8f5e8'
  },
  incompleteBadge: {
    backgroundColor: '#fff3e0'
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600'
  },
  completedText: {
    color: '#4CAF50'
  },
  incompleteText: {
    color: '#FF9800'
  },
  deleteIconButton: {
    padding: 4
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center'
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A6572'
  },
  closeButton: {
    padding: 4
  },
  modalBody: {
    padding: 20
  },
  modalInfo: {
    gap: 16
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  detailText: {
    flex: 1
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  detailValue: {
    fontSize: 16,
    color: '#4A6572'
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic'
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8
  },
  deleteModalButton: {
    backgroundColor: '#F44336'
  },
  closeModalButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  deleteModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  closeModalButtonText: {
    color: '#4A6572',
    fontSize: 16,
    fontWeight: '600'
  }
});