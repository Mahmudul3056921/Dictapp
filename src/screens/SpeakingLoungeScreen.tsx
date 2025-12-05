// src/screens/SpeakingLoungeScreen.tsx
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';
import { Icons } from '../components/Icons';

type OnlineUser = {
  email: string;
  displayName?: string;
};

type CommunityMessage = {
  text: string;
  userEmail: string;
  displayName?: string;
  createdAt?: string;
};

const ZOOM_SPEAKING_URL =
  'https://us06web.zoom.us/j/86486888074?pwd=ez5TggFszRimUqmhvd4nGLR5un9pNG.1';

const getDisplayName = (emailOrName?: string | null) => {
  if (!emailOrName) return 'User';

  const email = emailOrName.toString().trim();
  const local = email.split('@')[0];

  const dotIndex = local.indexOf('.');
  if (dotIndex !== -1) {
    return local.substring(0, dotIndex);
  }

  return local;
};

// Use your SVG icon
const LoungeIcon = () => <Icons.Icon10 width={32} height={32} />;

const SpeakingLoungeScreen = () => {
  const { user } = useContext(AuthContext);

  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [message, setMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const loadMessages = async (showLoading = true) => {
    if (!user) return;
    try {
      if (showLoading) setLoadingMessages(true);
      const res = await api.get('/community/messages');
      setMessages(res.data || []);
    } catch (err: any) {
      console.log('messages fetch error:', err?.response?.data || err.message);
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  // Heartbeat
  useEffect(() => {
    if (!user) return;

    const sendHeartbeat = async () => {
      try {
        await api.post('/me/heartbeat');
      } catch {
        // ignore
      }
    };

    sendHeartbeat();
    const id = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(id);
  }, [user]);

  // Online users
  useEffect(() => {
    if (!user) return;

    const fetchOnline = async () => {
      try {
        const res = await api.get('/online-users');
        setOnlineUsers(res.data || []);
      } catch (err: any) {
        console.log('online users error:', err?.response?.data || err.message);
      }
    };

    fetchOnline();
    const id = setInterval(fetchOnline, 15000);
    return () => clearInterval(id);
  }, [user]);

  // Messages
  useEffect(() => {
    if (!user) return;
    loadMessages(true);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async () => {
    if (!message.trim() || !user) return;
    try {
      setSending(true);
      await api.post('/community/messages', { text: message.trim() });
      setMessage('');
      await loadMessages(false);
    } catch (err: any) {
      console.log('send message error:', err?.response?.data || err.message);
    } finally {
      setSending(false);
    }
  };

  const openZoom = async () => {
    if (!ZOOM_SPEAKING_URL) {
      Alert.alert('Zoom link missing', 'Please contact support.');
      return;
    }

    try {
      await Linking.openURL(ZOOM_SPEAKING_URL);
    } catch (e) {
      console.log('Zoom link error:', e);
      Alert.alert(
        'Could not open Zoom',
        'Please check that you have a browser or Zoom installed on your device.'
      );
    }
  };

  const meName = getDisplayName(user?.email || '');

  const renderMessageItem = (item: CommunityMessage, index: number) => {
    const isMe = item.userEmail === user?.email;

    return (
      <View
        key={index.toString()}
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowOther,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
          ]}
        >
          {!isMe && (
            <Text style={styles.messageSender}>
              {getDisplayName(item.displayName || item.userEmail)}
            </Text>
          )}
          <Text style={styles.messageText}>{item.text}</Text>
          {item.createdAt ? (
            <Text style={styles.messageTime}>
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  // ---------- Not logged in state ----------
  if (!user) {
    return (
      <View style={styles.notLoggedScreen}>
        <View style={styles.notLoggedIconWrap}>
          <LoungeIcon />
        </View>
        <Text style={styles.notLoggedTitle}>Speaking Lounge</Text>
        <Text style={styles.notLoggedSubtitle}>
          Please log in from the Profile tab to join the Speaking Lounge and
          community chat.
        </Text>
      </View>
    );
  }

  // ---------- Logged in layout ----------
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          {/* Header with your icon */}
          <View style={styles.headerRow}>
            <View style={styles.headerIconCircle}>
              <LoungeIcon />
            </View>
            <View>
              <Text style={styles.headerTitle}>Speaking Lounge</Text>
              <Text style={styles.headerSubtitle}>
                Practice German with other learners in real time.
              </Text>
            </View>
          </View>

          {/* Top cards: Online users + Zoom */}
          <View style={styles.topSection}>
            <Card style={styles.card} mode="elevated">
              <Card.Content>
                <Text style={styles.cardTitle}>Online learners</Text>
                <Text style={styles.cardSubtitle}>
                  Learners who have been active in the last few minutes.
                </Text>

                <View style={styles.onlineList}>
                  {onlineUsers.length === 0 ? (
                    <Text style={styles.onlineEmpty}>
                      No one is online right now. Please try again in a few
                      minutes.
                    </Text>
                  ) : (
                    onlineUsers.map((u) => (
                      <View key={u.email} style={styles.onlineChip}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineName}>
                          {getDisplayName(u.displayName || u.email)}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.zoomCard} mode="elevated">
              <Card.Content>
                <Text style={styles.zoomTitle}>Speaking Practice Room</Text>
                <Text style={styles.zoomText}>
                  Join the live Zoom room to practice speaking German together.
                </Text>

                {ZOOM_SPEAKING_URL ? (
                  <Button
                    mode="contained"
                    style={styles.zoomButton}
                    contentStyle={styles.zoomButtonContent}
                    buttonColor="#2563EB"
                    labelStyle={styles.zoomButtonLabel}
                    onPress={openZoom}
                  >
                    Join Zoom Speaking Room
                  </Button>
                ) : (
                  <Text style={styles.zoomMissing}>
                    Zoom link is not set yet. Please contact support.
                  </Text>
                )}
              </Card.Content>
            </Card>
          </View>

          {/* Chat */}
          <Card style={styles.chatCard} mode="elevated">
            <Card.Content style={styles.chatCardContent}>
              <View style={styles.chatHeader}>
                <View>
                  <Text style={styles.chatTitle}>Community Chat</Text>
                  <Text style={styles.chatSubtitle}>Logged in as {meName}</Text>
                </View>
                <View style={styles.chatIconCircle}>
                  <LoungeIcon />
                </View>
              </View>

              <View style={styles.chatMessagesWrapper}>
                {loadingMessages ? (
                  <View style={styles.chatLoading}>
                    <ActivityIndicator />
                    <Text style={styles.chatLoadingText}>
                      Loading messages…
                    </Text>
                  </View>
                ) : messages.length === 0 ? (
                  <Text style={styles.chatEmptyText}>
                    No messages yet. Be the first one to say hi 🙂
                  </Text>
                ) : (
                  <ScrollView
                    contentContainerStyle={styles.chatListContent}
                    keyboardShouldPersistTaps="handled"
                  >
                    {messages.map((m, idx) => renderMessageItem(m, idx))}
                  </ScrollView>
                )}
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  mode="outlined"
                  style={styles.input}
                  placeholder="Write a message to other learners…"
                  value={message}
                  onChangeText={setMessage}
                  dense
                  textColor="#111827"
                  outlineColor="#D1D5DB"
                  activeOutlineColor="#2563EB"
                  theme={{
                    colors: {
                      text: '#111827',
                      placeholder: '#9CA3AF',
                      primary: '#2563EB',
                    },
                  }}
                />
                <Button
                  mode="contained"
                  style={styles.sendButton}
                  contentStyle={styles.sendButtonContent}
                  buttonColor="#4F46E5"
                  onPress={handleSend}
                  loading={sending}
                  disabled={!message.trim() || sending}
                >
                  <Ionicons name="send" size={18} color="#ffffff" />
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SpeakingLoungeScreen;

// ----------------- STYLES -----------------
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EEF2FF', // brighter, soft indigo background
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  inner: {
    flex: 1,
  },

  // ----- Not logged in -----
  notLoggedScreen: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  notLoggedIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  notLoggedTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  notLoggedSubtitle: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
  },

  // ----- Header -----
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },

  // ----- Top section -----
  topSection: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
  },
  onlineList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  onlineEmpty: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  onlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    marginRight: 4,
    marginBottom: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 4,
  },
  onlineName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1F2937',
  },

  // ----- Zoom card -----
  zoomCard: {
    borderRadius: 18,
    backgroundColor: '#6366F1', // brighter indigo
    elevation: 3,
  },
  zoomTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  zoomText: {
    fontSize: 13,
    color: '#E0E7FF',
    marginBottom: 10,
  },
  zoomButton: {
    borderRadius: 999,
    backgroundColor: '#F97316',
  },
  zoomButtonContent: {
    paddingVertical: 6,
  },
  zoomButtonLabel: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  zoomMissing: {
    fontSize: 11,
    color: '#FEE2E2',
  },

  // ----- Chat -----
  chatCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  chatCardContent: {
    paddingBottom: 8,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  chatSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  chatMessagesWrapper: {
    flex: 1,
    minHeight: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chatLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  chatLoadingText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  chatEmptyText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
  },
  chatListContent: {
    paddingBottom: 4,
  },

  // ----- Messages -----
  messageRow: {
    marginBottom: 8,
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  messageBubbleMe: {
    backgroundColor: '#E0F2FE', // soft light blue
    borderRadius: 16,
    borderTopRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  messageSender: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 3,
  },
  messageText: {
    fontSize: 14,
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
  },

  // ----- Input -----
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  sendButton: {
    marginLeft: 6,
    borderRadius: 50,
    backgroundColor: '#2563EB',
  },
  sendButtonContent: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
