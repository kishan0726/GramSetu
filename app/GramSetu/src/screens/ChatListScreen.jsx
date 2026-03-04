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
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';

const ChatListScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatUserId, setChatUserId] = useState(null);
  const [chatUserData, setChatUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedChatUserId = await AsyncStorage.getItem('chatUserId');
      const storedChatUserData = await AsyncStorage.getItem('chatUserData');
      
      if (!storedChatUserId || !storedChatUserData) {
        navigation.replace('ChatSetupScreen');
        return;
      }

      setChatUserId(storedChatUserId);
      setChatUserData(JSON.parse(storedChatUserData));
      
      // Set online status
      await db.ref(`chat_users/${storedChatUserId}/online`).set(true);
      await db.ref(`chat_users/${storedChatUserId}/lastSeen`).set(Date.now());

      loadChats(storedChatUserId);
      loadPendingRequests(storedChatUserId);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const loadPendingRequests = (userId) => {
    const requestsRef = db.ref('chat_requests');
    
    requestsRef.on('value', (snapshot) => {
      const requests = snapshot.val() || {};
      let count = 0;
      
      Object.values(requests).forEach(req => {
        if (req.to === userId && req.status === 'pending') {
          count++;
        }
      });
      
      setPendingRequests(count);
    });

    return () => requestsRef.off();
  };

  const loadChats = (userId) => {
    const chatsRef = db.ref('chats');
    
    chatsRef.on('value', (snapshot) => {
      const allChats = snapshot.val() || {};
      const userChats = [];

      // Use Promise.all to handle async operations
      const promises = [];

      Object.entries(allChats).forEach(([chatId, chatData]) => {
        // Check if user is participant
        if (chatData.participants && chatData.participants[userId]) {
          // Get the other participant
          const otherUserId = Object.keys(chatData.participants).find(id => id !== userId);
          
          if (otherUserId) {
            // Create promise for each user data fetch
            const promise = db.ref(`user_data/${otherUserId}`).once('value').then(userSnapshot => {
              const userData = userSnapshot.val();
              
              // Also get chat user data for online status
              return db.ref(`chat_users/${otherUserId}`).once('value').then(chatUserSnapshot => {
                const chatUser = chatUserSnapshot.val();
                
                // Get profile image if available
                return db.ref(`user_data/${otherUserId}/profile_image`).once('value').then(imageSnapshot => {
                  const profileImage = imageSnapshot.val();
                  
                  if (userData) {
                    userChats.push({
                      id: chatId,
                      otherUserId,
                      userData,
                      chatUser,
                      profileImage: profileImage?.uri || null,
                      lastMessage: chatData.lastMessage || {},
                      createdAt: chatData.createdAt,
                      unreadCount: calculateUnreadCount(chatData.messages, userId),
                    });
                  }
                });
              });
            });
            promises.push(promise);
          }
        }
      });

      // Wait for all user data to be fetched
      Promise.all(promises).then(() => {
        // Sort by last message timestamp
        userChats.sort((a, b) => 
          (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0)
        );

        setChats(userChats);
        setLoading(false);
      });
    });

    return () => chatsRef.off();
  };

  const calculateUnreadCount = (messages, userId) => {
    if (!messages) return 0;
    
    let count = 0;
    Object.values(messages).forEach(msg => {
      if (msg.senderId !== userId && !msg.seen?.[userId]) {
        count++;
      }
    });
    return count;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
    }
  };

  // Get initials for avatar fallback
  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return '👤';
    return (firstName?.charAt(0) || '') + (lastName?.charAt(0) || '');
  };

  const renderChatItem = ({ item }) => {
    const fullName = `${item.userData.firstName || ''} ${item.userData.lastName || ''}`.trim();
    const initials = getInitials(item.userData.firstName, item.userData.lastName);
    const isOnline = item.chatUser?.online || false;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('ChatScreen', {
          chatId: item.id,
          otherUserId: item.otherUserId,
          otherUser: item.userData,
        })}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {item.profileImage ? (
            <Image 
              source={{ uri: item.profileImage }} 
              style={styles.avatarImage}
              onError={() => console.log('Failed to load profile image')}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {initials.length > 0 ? initials : '👤'}
              </Text>
            </View>
          )}
          {isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {fullName || 'User'}
            </Text>
            <Text style={styles.messageTime}>
              {formatTime(item.lastMessage?.timestamp)}
            </Text>
          </View>

          <View style={styles.messageRow}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage?.text || 'No messages yet'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chats</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('ChatRequestsScreen')}
          >
            <View>
              <Icon name="people-alt" size={24} color="#ffffff" />
              {pendingRequests > 0 && (
                <View style={styles.requestBadge}>
                  <Text style={styles.requestBadgeText}>
                    {pendingRequests > 9 ? '9+' : pendingRequests}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('AddChatUserScreen')}
          >
            <Icon name="person-add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="chat" size={60} color="#e2e8f0" />
            <Text style={styles.emptyText}>No chats yet</Text>
            <Text style={styles.emptySubText}>
              Start a conversation by adding a new chat
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddChatUserScreen')}
            >
              <Text style={styles.emptyButtonText}>Find Users</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

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
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    padding: 8,
  },
  requestBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#38bdf8',
  },
  requestBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
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
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
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
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarText: {
    fontSize: 24,
    color: '#38bdf8',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  messageTime: {
    fontSize: 11,
    color: '#94a3b8',
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#38bdf8',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 4,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#38bdf8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
});

export default ChatListScreen;