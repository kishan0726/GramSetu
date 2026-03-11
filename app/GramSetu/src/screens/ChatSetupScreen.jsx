import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';

const ChatSetupScreen = ({ navigation, route }) => {
  const { t } = useLanguage();
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    checkExistingUserAndNavigate();
  }, []);

  // Check Exitsing User And Navigate
  const checkExistingUserAndNavigate = async () => {
    try {
      console.log('Checking for existing user session...');
      
      const session = await AsyncStorage.getItem('userSession');
      
      if (!session) {
        console.log('No session found');
        Alert.alert(
          'Error',
          'No user session found. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('UserLogin')
            }
          ]
        );
        setGenerating(false);
        return;
      }

      const parsed = JSON.parse(session);
      const sessionUserId = parsed?.userId;
      console.log('Session userId:', sessionUserId);
      
      if (!sessionUserId) {
        throw new Error('User ID not found in session');
      }

      setUserId(sessionUserId);

      console.log('Fetching user data from Firebase for ID:', sessionUserId);
      const userSnapshot = await db.ref(`user_data/${sessionUserId}`).once('value');
      
      if (userSnapshot.exists()) {
        const user = userSnapshot.val();
        console.log('User data found:', user.firstName, user.lastName);
        setUserData(user);
        
        await checkChatAccount(sessionUserId);
      } else {
        throw new Error('User data not found in database');
      }

    } catch (error) {
      console.error('Error checking existing user:', error);
      Alert.alert(
        'Error',
        'Failed to load user data. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
      setGenerating(false);
    }
  };

  // Check Chat Account
  const checkChatAccount = async (userId) => {
    try {
      console.log('Checking for existing chat account with userId:', userId);
      
      const chatUserSnapshot = await db.ref(`chat_users/${userId}`).once('value');
      
      if (chatUserSnapshot.exists()) {
        const chatUser = chatUserSnapshot.val();
        
        console.log('Found existing chat account with userId as key:', userId);
        
        await AsyncStorage.setItem('chatUserId', userId);
        await AsyncStorage.setItem('chatUserData', JSON.stringify(chatUser));
        
        console.log('Saved to AsyncStorage, navigating to ChatList...');
        navigation.replace('ChatListScreen');
        return;
      }

      const chatUsersSnapshot = await db.ref('chat_users').orderByChild('userDataId').equalTo(userId).once('value');
      
      if (chatUsersSnapshot.exists()) {
        const chatUserData = chatUsersSnapshot.val();
        const chatUserId = Object.keys(chatUserData)[0];
        const chatUser = chatUserData[chatUserId];
        
        console.log('Found existing chat account with userDataId:', chatUserId);
        
        await AsyncStorage.setItem('chatUserId', chatUserId);
        await AsyncStorage.setItem('chatUserData', JSON.stringify(chatUser));
        
        console.log('Saved to AsyncStorage, navigating to ChatList...');
        navigation.replace('ChatListScreen');
        return;
      }

      console.log('No existing chat account found, showing setup screen');
      setGenerating(false);
    } catch (error) {
      console.error('Error checking chat account:', error);
      setGenerating(false);
    }
  };

  // Create Chat Account
  const createChatAccount = async () => {
    if (!userData || !userId) {
      Alert.alert('Error', 'User data not available');
      return;
    }

    setLoading(true);
    console.log('Creating new chat account with userId as key:', userId);

    try {
      const chatUserId = userId;
      
      const exists = await db.ref(`chat_users/${chatUserId}`).once('value');
      
      if (exists.exists()) {
        console.log('Chat account already exists with this userId');
        const existingChatUser = exists.val();
        
        await AsyncStorage.setItem('chatUserId', chatUserId);
        await AsyncStorage.setItem('chatUserData', JSON.stringify(existingChatUser));
        
        Alert.alert(
          'Success',
          'Chat account already exists!',
          [{ text: 'OK', onPress: () => navigation.replace('ChatListScreen') }]
        );
        return;
      }

      const chatUser = {
        userDataId: userId,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        online: true,
        lastSeen: Date.now(),
        createdAt: Date.now(),
        profileImage: userData.profilePhotoName || null,
      };

      console.log('Saving chat user to Firebase with key:', chatUserId);
      
      await db.ref(`chat_users/${chatUserId}`).set(chatUser);

      await createSearchIndexes(chatUserId, userData);

      await AsyncStorage.setItem('chatUserId', chatUserId);
      await AsyncStorage.setItem('chatUserData', JSON.stringify(chatUser));

      console.log('Chat account created successfully, navigating to ChatList...');

      Alert.alert(
        'Success',
        'Chat account created successfully!',
        [{ text: 'OK', onPress: () => navigation.replace('ChatListScreen') }]
      );

    } catch (error) {
      console.error('Error creating chat account:', error);
      Alert.alert('Error', 'Failed to create chat account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create Search Indexes
  const createSearchIndexes = async (chatUserId, userData) => {
    const updates = {};
    
    if (userData.firstName) {
      const firstNameKey = userData.firstName.toLowerCase();
      updates[`user_search/${firstNameKey}/${chatUserId}`] = {
        firstName: userData.firstName,
        lastName: userData.lastName || '',
        chatUserId: chatUserId,
      };
    }

    if (userData.lastName) {
      const lastNameKey = userData.lastName.toLowerCase();
      updates[`user_search/${lastNameKey}/${chatUserId}`] = {
        firstName: userData.firstName || '',
        lastName: userData.lastName,
        chatUserId: chatUserId,
      };
    }

    if (userData.firstName || userData.lastName) {
      const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.toLowerCase().trim();
      if (fullName) {
        updates[`user_search/${fullName}/${chatUserId}`] = {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          chatUserId: chatUserId,
        };
      }
    }

    if (userData.contactNumber) {
      updates[`user_search/${userData.contactNumber}/${chatUserId}`] = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        chatUserId: chatUserId,
      };
    }

    await db.ref().update(updates);
  };

  // Generating
  if (generating) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>Setting up chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userData || !userId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={60} color="#ef4444" />
          <Text style={styles.errorText}>User data not available</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={checkExistingUserAndNavigate}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Setup</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="chat" size={80} color="#38bdf8" />
        </View>

        <Text style={styles.title}>Welcome to Village Chat!</Text>
        
        <Text style={styles.subtitle}>
          To start chatting with other villagers, we need to create your chat profile.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="person" size={20} color="#64748b" />
            <Text style={styles.infoText}>
              {userData.firstName || ''} {userData.lastName || ''}
            </Text>
          </View>
          
          {userData.contactNumber && (
            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color="#64748b" />
              <Text style={styles.infoText}>{userData.contactNumber}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.setupButton, loading && styles.setupButtonDisabled]}
          onPress={createChatAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Icon name="check-circle" size={20} color="#ffffff" />
              <Text style={styles.setupButtonText}>Create Chat Account</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          Your chat ID will be your user ID for consistency.
        </Text>
      </View>
    </SafeAreaView>
  );
};

// StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#38bdf8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#38bdf8',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#38bdf8',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  setupButton: {
    backgroundColor: '#38bdf8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    gap: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  setupButtonDisabled: {
    opacity: 0.7,
  },
  setupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  note: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ChatSetupScreen;