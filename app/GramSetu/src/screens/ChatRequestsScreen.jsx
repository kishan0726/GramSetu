import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';

const ChatRequestsScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatUserId, setChatUserId] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  // Fetch User Data from DB
  const loadUserData = async () => {
    try {
      const storedChatUserId = await AsyncStorage.getItem('chatUserId');
      console.log('Current user chat ID:', storedChatUserId);
      setChatUserId(storedChatUserId);
      loadRequests(storedChatUserId);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  // Fetch Requests from DB
  const loadRequests = (userId) => {
    const requestsRef = db.ref('chat_requests');
    
    requestsRef.on('value', async (snapshot) => {
      const allRequests = snapshot.val() || {};
      const incomingRequests = [];

      for (const [id, req] of Object.entries(allRequests)) {
        if (req.to === userId && req.status === 'pending') {
          // Get sender info from chat_users
          const userSnapshot = await db.ref(`chat_users/${req.from}`).once('value');
          const sender = userSnapshot.val();
          
          if (sender) {
            incomingRequests.push({
              id,
              ...req,
              sender,
            });
          }
        }
      }

      console.log('Incoming requests:', incomingRequests.length);
      setRequests(incomingRequests);
      setLoading(false);
    });

    return () => requestsRef.off();
  };

  // Create ChatRoom
  const createChatRoom = async (fromUserId, toUserId) => {
    const users = [fromUserId, toUserId].sort();
    const roomId = `chat_${users[0]}_${users[1]}`;

    const chatRoom = {
      participants: {
        [users[0]]: true,
        [users[1]]: true,
      },
      createdAt: Date.now(),
    };

    await db.ref(`chats/${roomId}`).set(chatRoom);
    return roomId;
  };

  // Handle Request Accept
  const handleAccept = async (request) => {
    setProcessingId(request.id);
    try {
      console.log('Accepting request:', request.id);
      
      // Update request status
      await db.ref(`chat_requests/${request.id}`).update({
        status: 'accepted',
        updatedAt: Date.now(),
      });

      // Create chat room
      const roomId = await createChatRoom(request.from, request.to);
      console.log('Chat room created:', roomId);

      Alert.alert(
        'Success',
        'Request accepted! You can now chat.',
        [
          {
            text: 'Go to Chat',
            onPress: () => {
              navigation.navigate('ChatScreen', {
                chatId: roomId,
                otherUserId: request.from,
                otherUser: request.sender,
              });
            },
          },
          { text: 'Stay Here', style: 'cancel' },
        ]
      );

    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Request Reject
  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    try {
      console.log('Rejecting request:', requestId);
      
      await db.ref(`chat_requests/${requestId}`).update({
        status: 'rejected',
        updatedAt: Date.now(),
      });

      Alert.alert('Success', 'Request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert('Error', 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  // Render Request Item
  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.sender.firstName?.charAt(0) || '👤'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.sender.firstName} {item.sender.lastName}
          </Text>
          <Text style={styles.requestTime}>
            {new Date(item.createdAt).toLocaleDateString()} at{' '}
            {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAccept(item)}
          disabled={processingId === item.id}
        >
          {processingId === item.id ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Icon name="check" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>Accept</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(item.id)}
          disabled={processingId === item.id}
        >
          {processingId === item.id ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Icon name="close" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat Requests</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
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
        <Text style={styles.headerTitle}>Chat Requests</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="people-alt" size={60} color="#e2e8f0" />
            <Text style={styles.emptyText}>No pending requests</Text>
            <Text style={styles.emptySubText}>
              When someone sends you a chat request, it will appear here
            </Text>
          </View>
        }
      />
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
  listContainer: {
    padding: 16,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 20,
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
  requestTime: {
    fontSize: 12,
    color: '#64748b',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
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

export default ChatRequestsScreen;