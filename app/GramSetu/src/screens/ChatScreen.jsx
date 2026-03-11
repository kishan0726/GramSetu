import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';

const ChatScreen = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { chatId, otherUserId, otherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatUserId, setChatUserId] = useState(null);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const [otherUserProfileImage, setOtherUserProfileImage] = useState(null);
  const typingTimeoutRef = useRef(null);
  const flatListRef = useRef();
  const inputRef = useRef();

  const getStatusIcon = (message) => {
    if (message.senderId !== chatUserId) return null;
    
    if (message.seen?.[otherUserId]) {
      return { name: 'done-all', color: '#38bdf8' };
    } else if (message.delivered?.[otherUserId]) {
      return { name: 'done-all', color: '#64748b' };
    } else {
      return { name: 'check', color: '#94a3b8' };
    }
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return '👤';
    return (firstName?.charAt(0) || '') + (lastName?.charAt(0) || '');
  };

  useEffect(() => {
    loadUserData();
    loadOtherUserProfile();
    setupPresenceListener();
    setupTypingListener();

    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      // Clean up typing status when leaving
      if (chatUserId) {
        db.ref(`chats/${chatId}/typing/${chatUserId}`).remove();
      }
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (inputText.trim().length > 0 && !isTyping) {
      setIsTyping(true);
      db.ref(`chats/${chatId}/typing/${chatUserId}`).set(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        db.ref(`chats/${chatId}/typing/${chatUserId}`).remove();
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [inputText]);

  // Fetch User Data from DB
  const loadUserData = async () => {
    try {
      const storedChatUserId = await AsyncStorage.getItem('chatUserId');
      console.log('Current user chat ID:', storedChatUserId);
      
      if (!storedChatUserId) {
        navigation.replace('ChatSetupScreen');
        return;
      }

      setChatUserId(storedChatUserId);
      
      const currentUserSnapshot = await db.ref(`user_data/${storedChatUserId}/profile_image`).once('value');
      if (currentUserSnapshot.exists()) {
        setCurrentUserProfile(currentUserSnapshot.val().uri);
      }
      
      loadMessages();
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  // Fetch Other USer Profile
  const loadOtherUserProfile = async () => {
    try {
      const otherUserSnapshot = await db.ref(`user_data/${otherUserId}/profile_image`).once('value');
      if (otherUserSnapshot.exists()) {
        setOtherUserProfileImage(otherUserSnapshot.val().uri);
      }
      
      const userSnapshot = await db.ref(`user_data/${otherUserId}`).once('value');
      if (userSnapshot.exists()) {
        setOtherUserProfile(userSnapshot.val());
      }
    } catch (error) {
      console.error('Error loading other user profile:', error);
    }
  };

  // Setup Presence Listener
  const setupPresenceListener = () => {
    const userRef = db.ref(`chat_users/${otherUserId}`);
    
    userRef.on('value', (snapshot) => {
      const user = snapshot.val();
      setOtherUserOnline(user?.online || false);
    });

    return () => userRef.off();
  };

  // Setup Typing Listener
  const setupTypingListener = () => {
    const typingRef = db.ref(`chats/${chatId}/typing/${otherUserId}`);
    
    typingRef.on('value', (snapshot) => {
      setOtherUserTyping(snapshot.val() || false);
    });

    return () => typingRef.off();
  };

  // Fetch Messages from DB
  const loadMessages = () => {
    const messagesRef = db.ref(`chats/${chatId}/messages`);
    
    messagesRef.on('value', (snapshot) => {
      const data = snapshot.val() || {};
      const messageList = Object.entries(data)
        .map(([id, msg]) => ({ id, ...msg }))
        .sort((a, b) => a.timestamp - b.timestamp);

      setMessages(messageList);
      setLoading(false);
      
      markMessagesAsSeen(messageList);
      
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return () => messagesRef.off();
  };

  // Mark Message as seen
  const markMessagesAsSeen = (messageList) => {
    messageList.forEach(msg => {
      if (msg.senderId !== chatUserId && !msg.seen?.[chatUserId]) {
        db.ref(`chats/${chatId}/messages/${msg.id}/seen/${chatUserId}`).set(true);
      }
    });
  };

  // Send Message
  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;

    setSending(true);
    const messageText = inputText.trim();

    try {
      const messageId = db.ref(`chats/${chatId}/messages`).push().key;
      const message = {
        senderId: chatUserId,
        text: messageText,
        timestamp: Date.now(),
        seen: {
          [chatUserId]: true,
        },
        delivered: {
          [chatUserId]: true,
        },
      };

      // Update messages
      await db.ref(`chats/${chatId}/messages/${messageId}`).set(message);

      // Update last message in chat room
      await db.ref(`chats/${chatId}/lastMessage`).set({
        text: messageText,
        timestamp: Date.now(),
        senderId: chatUserId,
      });

      setInputText('');
      
      // Remove typing indicator
      if (isTyping) {
        setIsTyping(false);
        await db.ref(`chats/${chatId}/typing/${chatUserId}`).remove();
      }

      // Dismiss keyboard
      Keyboard.dismiss();

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Format Time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format Date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
    }
  };

  // Dismiss Keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Render Message
  const renderMessage = ({ item, index }) => {
    const isMe = item.senderId === chatUserId;
    const statusIcon = getStatusIcon(item);
    const showDate = index === 0 || 
      formatDate(item.timestamp) !== formatDate(messages[index - 1]?.timestamp);

    return (
      <React.Fragment key={item.id}>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
          </View>
        )}
        <View style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.otherMessageContainer
        ]}>
          {!isMe && (
            <View style={styles.senderAvatarContainer}>
              {otherUserProfileImage ? (
                <Image 
                  source={{ uri: otherUserProfileImage }} 
                  style={styles.messageAvatarImage}
                  onError={() => console.log('Failed to load avatar')}
                />
              ) : (
                <View style={styles.messageAvatar}>
                  <Text style={styles.messageAvatarText}>
                    {getInitials(otherUser?.firstName, otherUser?.lastName)}
                  </Text>
                </View>
              )}
            </View>
          )}
          <View style={[
            styles.messageBubble,
            isMe ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}>
            <Text style={[
              styles.messageText,
              isMe ? styles.myMessageText : styles.otherMessageText
            ]}>
              {item.text}
            </Text>
            
            <View style={styles.messageFooter}>
              <Text style={styles.timestamp}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
          </View>
        </View>
      </React.Fragment>
    );
  };

  // Loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
        </View>
      </SafeAreaView>
    );
  }

  const fullName = `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.trim();
  const otherUserInitials = getInitials(otherUser?.firstName, otherUser?.lastName);

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

        <TouchableOpacity 
          style={styles.headerInfo}
          onPress={() => {
            Alert.alert('User Info', `${fullName || 'User'}`);
          }}
        >
          <View style={styles.headerAvatar}>
            {otherUserProfileImage ? (
              <Image 
                source={{ uri: otherUserProfileImage }} 
                style={styles.headerAvatarImage}
                onError={() => console.log('Failed to load header avatar')}
              />
            ) : (
              <Text style={styles.headerAvatarText}>
                {otherUserInitials}
              </Text>
            )}
          </View>
          <View>
            <Text style={styles.headerName}>
              {fullName || 'User'}
            </Text>
            <Text style={styles.headerStatus}>
              {otherUserTyping ? 'Typing...' : (otherUserOnline ? 'Online' : 'Offline')}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => {
            Alert.alert(
              'Chat Options',
              'Choose an option',
              [
                { text: 'View Profile', onPress: () => {} },
                { text: 'Clear Chat', onPress: () => {} },
                { text: 'Block User', onPress: () => {}, style: 'destructive' },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        >
          <Icon name="more-vert" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Messages - Touch to dismiss keyboard */}
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onScrollBeginDrag={dismissKeyboard}
        />
      </TouchableWithoutFeedback>

      {/* Typing Indicator */}
      {otherUserTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>{otherUser?.firstName || 'User'} is typing...</Text>
        </View>
      )}

      {/* Input Area - Fixed for Android */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={[
          styles.keyboardAvoidingView,
          Platform.OS === 'android' && { marginBottom: keyboardHeight }
        ]}
      >
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#94a3b8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            returnKeyType="default"
            blurOnSubmit={false}
          />

          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Icon name="send" size={20} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  headerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarText: {
    fontSize: 18,
    color: '#38bdf8',
    fontWeight: '600',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerStatus: {
    fontSize: 11,
    color: '#ffffff',
    opacity: 0.8,
  },
  headerIcon: {
    padding: 8,
    marginRight: -8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    marginBottom: 8,
    maxWidth: '80%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  senderAvatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  messageAvatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  messageAvatarText: {
    fontSize: 10,
    color: '#38bdf8',
    fontWeight: '600',
  },
  messageBubble: {
    borderRadius: 18,
    padding: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    maxWidth: '100%',
  },
  myMessageBubble: {
    backgroundColor: '#38bdf8',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#1e293b',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: 10,
    color: '#94a3b8',
    marginRight: 4,
  },
  statusIcon: {
    marginLeft: 2,
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 56,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  emojiButton: {
    padding: 8,
  },
  sendButton: {
    backgroundColor: '#38bdf8',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
});

export default ChatScreen;