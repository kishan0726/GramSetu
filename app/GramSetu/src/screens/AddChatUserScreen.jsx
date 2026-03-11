import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';

const AddChatUserScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [chatUserId, setChatUserId] = useState(null);
  const [existingRequests, setExistingRequests] = useState({});
  const [existingChats, setExistingChats] = useState({});

  useEffect(() => {
    loadUserData();
  }, []);

  // Fetch Data from DB
  const loadUserData = async () => {
    try {
      const storedChatUserId = await AsyncStorage.getItem('chatUserId');
      console.log('Current user chat ID:', storedChatUserId);
      setChatUserId(storedChatUserId);
      
      if (storedChatUserId) {
        loadExistingRequests(storedChatUserId);
        loadExistingChats(storedChatUserId);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Fetch Existing Requests from DB
  const loadExistingRequests = (userId) => {
    const requestsRef = db.ref('chat_requests');
    
    requestsRef.on('value', (snapshot) => {
      const requests = snapshot.val() || {};
      const userRequests = {};
      
      Object.entries(requests).forEach(([id, req]) => {
        if (req.from === userId || req.to === userId) {
          userRequests[req.from === userId ? req.to : req.from] = req.status;
        }
      });
      
      console.log('Existing requests:', userRequests);
      setExistingRequests(userRequests);
    });

    return () => requestsRef.off();
  };

  // Fetch Existing Chats from DB
  const loadExistingChats = (userId) => {
    const chatsRef = db.ref('chats');
    
    chatsRef.on('value', (snapshot) => {
      const chats = snapshot.val() || {};
      const userChats = {};
      
      Object.entries(chats).forEach(([chatId, chat]) => {
        if (chat.participants && chat.participants[userId]) {
          const otherUserId = Object.keys(chat.participants).find(id => id !== userId);
          if (otherUserId) {
            userChats[otherUserId] = 'accepted';
          }
        }
      });
      
      console.log('Existing chats:', userChats);
      setExistingChats(userChats);
    });

    return () => chatsRef.off();
  };

  // Search User
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const searchTerm = query.toLowerCase().trim();

    try {
      console.log('Searching for:', searchTerm);
      
      // Search in user_search index
      const snapshot = await db.ref('user_search').once('value');
      const allIndexes = snapshot.val() || {};
      
      let foundUsers = [];
      
      // Search by partial match in keys
      Object.entries(allIndexes).forEach(([key, users]) => {
        if (key.includes(searchTerm)) {
          Object.entries(users).forEach(([id, userData]) => {
            // Don't include current user
            if (id !== chatUserId) {
              foundUsers.push({
                id,
                ...userData,
              });
            }
          });
        }
      });

      // Remove duplicates (keep first occurrence)
      const uniqueUsers = [];
      const seenIds = new Set();
      
      foundUsers.forEach(user => {
        if (!seenIds.has(user.id)) {
          seenIds.add(user.id);
          uniqueUsers.push(user);
        }
      });

      console.log('Found users:', uniqueUsers.length);
      setSearchResults(uniqueUsers);

    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  // Relationship status
  const getRelationshipStatus = (userId) => {
    if (existingChats[userId]) {
      return { status: 'connected', text: 'Connected', color: '#10b981' };
    }
    if (existingRequests[userId] === 'pending') {
      return { status: 'pending', text: 'Request Pending', color: '#f59e0b' };
    }
    if (existingRequests[userId] === 'accepted') {
      return { status: 'connected', text: 'Connected', color: '#10b981' };
    }
    if (existingRequests[userId] === 'rejected') {
      return { status: 'rejected', text: 'Rejected', color: '#ef4444' };
    }
    return { status: 'none', text: 'Send Request', color: '#38bdf8' };
  };

  // Send Request
  const sendChatRequest = async (toUserId) => {
    try {
      console.log('Sending request to:', toUserId);
      
      const existingStatus = existingRequests[toUserId];
      
      if (existingStatus === 'pending') {
        Alert.alert('Info', 'Request already pending');
        return;
      }

      if (existingStatus === 'accepted' || existingChats[toUserId]) {
        Alert.alert('Info', 'You are already connected');
        return;
      }

      const requestRef = db.ref('chat_requests').push();
      const requestId = requestRef.key;

      const request = {
        from: chatUserId,
        to: toUserId,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await requestRef.set(request);

      setExistingRequests(prev => ({
        ...prev,
        [toUserId]: 'pending'
      }));

      Alert.alert(
        'Success',
        'Chat request sent successfully'
      );

    } catch (error) {
      console.error('Error sending request:', error);
      Alert.alert('Error', 'Failed to send request');
    }
  };

  // Handle Search
  const handleSearch = (text) => {
    setSearchQuery(text);
    searchUsers(text);
  };

  // Render User Item
  const renderUserItem = ({ item }) => {
    const relationship = getRelationshipStatus(item.id);

    return (
      <View style={styles.userCard}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>
            {item.firstName?.charAt(0) || '👤'}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.firstName} {item.lastName}
          </Text>
          {item.phoneNumber && (
            <Text style={styles.userPhone}>{item.phoneNumber}</Text>
          )}
        </View>

        {relationship.status === 'connected' ? (
          <View style={[styles.statusBadge, { backgroundColor: '#e6f7e6' }]}>
            <Icon name="check-circle" size={16} color="#10b981" />
            <Text style={[styles.statusText, { color: '#10b981' }]}>
              Connected
            </Text>
          </View>
        ) : relationship.status === 'pending' ? (
          <View style={[styles.statusBadge, { backgroundColor: '#fff3e0' }]}>
            <Icon name="hourglass-empty" size={16} color="#f59e0b" />
            <Text style={[styles.statusText, { color: '#f59e0b' }]}>
              Pending
            </Text>
          </View>
        ) : relationship.status === 'rejected' ? (
          <View style={[styles.statusBadge, { backgroundColor: '#fee2e2' }]}>
            <Icon name="cancel" size={16} color="#ef4444" />
            <Text style={[styles.statusText, { color: '#ef4444' }]}>
              Rejected
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => sendChatRequest(item.id)}
          >
            <Icon name="send" size={18} color="#38bdf8" />
            <Text style={styles.sendButtonText}>Send Request</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Find Users</Text>
        <TouchableOpacity
          style={styles.requestsButton}
          onPress={() => navigation.navigate('ChatRequests')}
        >
          <Icon name="people-alt" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Search Container */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searching && (
          <ActivityIndicator size="small" color="#38bdf8" style={styles.searchLoader} />
        )}
        {searchQuery.length > 0 && !searching && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {searching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>Searching users...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            searchQuery.length > 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="person-search" size={60} color="#e2e8f0" />
                <Text style={styles.emptyText}>No users found</Text>
                <Text style={styles.emptySubText}>
                  Try searching with a different name
                </Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="search" size={60} color="#e2e8f0" />
                <Text style={styles.emptyText}>Search for users</Text>
                <Text style={styles.emptySubText}>
                  Type a name to find other villagers
                </Text>
              </View>
            )
          }
        />
      )}
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
  requestsButton: {
    padding: 8,
    marginRight: -8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    padding: 0,
  },
  searchLoader: {
    marginLeft: 8,
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
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 22,
    color: '#38bdf8',
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: '#64748b',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 6,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  sendButtonText: {
    fontSize: 13,
    color: '#38bdf8',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default AddChatUserScreen;