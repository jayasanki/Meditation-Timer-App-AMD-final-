import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ProfileScreen() {
  const { user, logout, sessions, stats, updateUserProfile, resetPassword, loading } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your meditation data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Feature Coming Soon',
              'Account deletion will be available in the next update. For now, please contact support if you need to delete your account.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a valid name');
      return;
    }

    try {
      await updateUserProfile({ displayName: newName });
      setIsEditingName(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'No email address found');
      return;
    }

    setIsResettingPassword(true);
    try {
      await resetPassword(user.email);
      Alert.alert(
        'Password Reset Email Sent',
        'Check your email for instructions to reset your password.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getMemberSince = () => {
    if (!user?.createdAt) return 'N/A';
    
    const created = new Date(user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day';
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
      </View>

      {/* Profile Information Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditingName(!isEditingName)}
          >
            <Icon 
              name={isEditingName ? 'close' : 'edit'} 
              size={20} 
              color="#4A6572" 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoCard}>
          {isEditingName ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.nameInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Enter your name"
                autoFocus
              />
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleUpdateName}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="person" size={20} color="#4A6572" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Display Name</Text>
                  <Text style={styles.infoValue}>{user?.name || 'Not set'}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="email" size={20} color="#4A6572" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email Address</Text>
                  <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="calendar-today" size={20} color="#4A6572" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Member For</Text>
                  <Text style={styles.infoValue}>{getMemberSince()}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Statistics Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Meditation Statistics</Text>
          <TouchableOpacity 
            style={styles.statsButton}
            onPress={() => setShowStatsModal(true)}
          >
            <Icon name="insights" size={20} color="#4A6572" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#e8f5e8' }]}>
              <Icon name="check-circle" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Completed Sessions</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#e3f2fd' }]}>
              <Icon name="access-time" size={24} color="#2196F3" />
            </View>
            <Text style={styles.statNumber}>{formatDuration(stats.totalMinutes * 60)}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fff3e0' }]}>
              <Icon name="trending-up" size={24} color="#FF9800" />
            </View>
            <Text style={styles.statNumber}>{stats.averageSessionTime || 0}m</Text>
            <Text style={styles.statLabel}>Average Session</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fce4ec' }]}>
              <Icon name="local-fire-department" size={24} color="#E91E63" />
            </View>
            <Text style={styles.statNumber}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
        </View>
      </View>

      {/* App Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <View style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIcon}>
                <Icon name="notifications" size={20} color="#4A6572" />
              </View>
              <View>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive meditation reminders and progress updates
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#f0f0f0', true: '#4A6572' }}
              thumbColor={notificationsEnabled ? 'white' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIcon}>
                <Icon name="alarm" size={20} color="#4A6572" />
              </View>
              <View>
                <Text style={styles.settingLabel}>Daily Reminder</Text>
                <Text style={styles.settingDescription}>
                  Get reminded to meditate at your preferred time
                </Text>
              </View>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={setDailyReminder}
              trackColor={{ false: '#f0f0f0', true: '#4A6572' }}
              thumbColor={dailyReminder ? 'white' : '#f4f3f4'}
            />
          </View>

          {dailyReminder && (
            <View style={styles.timeSetting}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <Icon name="schedule" size={20} color="#4A6572" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Reminder Time</Text>
                  <Text style={styles.settingDescription}>
                    Set your preferred meditation time
                  </Text>
                </View>
              </View>
              <TextInput
                style={styles.timeInput}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="20:00"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          )}
        </View>
      </View>

      {/* Account Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        
        <View style={styles.actionsCard}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.passwordButton]}
            onPress={handleResetPassword}
            disabled={isResettingPassword}
          >
            {isResettingPassword ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Icon name="lock-reset" size={20} color="white" />
                <Text style={styles.actionButtonText}>Reset Password</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color="white" />
            <Text style={styles.actionButtonText}>Logout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <Icon name="delete-outline" size={20} color="#F44336" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Meditation Timer v1.0.0</Text>
        <Text style={styles.footerSubtext}>Designed for mindfulness and inner peace</Text>
      </View>

      {/* Statistics Modal */}
      <Modal
        visible={showStatsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStatsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detailed Statistics</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowStatsModal(false)}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatLabel}>Total Sessions</Text>
                <Text style={styles.modalStatValue}>{stats.totalSessions}</Text>
              </View>
              
              <View style={styles.modalStat}>
                <Text style={styles.modalStatLabel}>Total Meditation Time</Text>
                <Text style={styles.modalStatValue}>{formatDuration(stats.totalMinutes * 60)}</Text>
              </View>
              
              <View style={styles.modalStat}>
                <Text style={styles.modalStatLabel}>Average Session Length</Text>
                <Text style={styles.modalStatValue}>{stats.averageSessionTime || 0} minutes</Text>
              </View>
              
              <View style={styles.modalStat}>
                <Text style={styles.modalStatLabel}>Current Streak</Text>
                <Text style={styles.modalStatValue}>{stats.currentStreak} days</Text>
              </View>
              
              <View style={styles.modalStat}>
                <Text style={styles.modalStatLabel}>Longest Streak</Text>
                <Text style={styles.modalStatValue}>{stats.longestStreak} days</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    backgroundColor: '#4A6572',
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white'
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)'
  },
  section: {
    padding: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A6572'
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f4f8'
  },
  statsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f4f8'
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  editContainer: {
    flexDirection: 'row',
    gap: 12
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa'
  },
  saveButton: {
    backgroundColor: '#4A6572',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa'
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  infoContent: {
    flex: 1
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    textTransform: 'uppercase'
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A6572'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa'
  },
  timeSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A6572',
    marginBottom: 2
  },
  settingDescription: {
    fontSize: 12,
    color: '#666'
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 8,
    width: 80,
    textAlign: 'center',
    backgroundColor: '#f8f9fa'
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 12
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8
  },
  passwordButton: {
    backgroundColor: '#2196F3'
  },
  logoutButton: {
    backgroundColor: '#4A6572'
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F44336'
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600'
  },
  footer: {
    padding: 30,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center'
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
    maxWidth: 400
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
  modalStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa'
  },
  modalStatLabel: {
    fontSize: 16,
    color: '#666'
  },
  modalStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6572'
  }
});