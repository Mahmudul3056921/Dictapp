// src/screens/SpeakingLoungeScreen.tsx
import React, { useContext, useEffect, useState } from 'react';


import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,Alert,
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

const SpeakingLoungeScreen = () => {
  const { user } = useContext(AuthContext);

  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [message, setMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // 🆕 helper to load messages
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

  // 🔁 Heartbeat
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

  // 👥 Online users (keep polling)
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

  // 💬 Messages – load only once on mount / when user changes
  useEffect(() => {
    if (!user) return;
    loadMessages(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSend = async () => {
    if (!message.trim() || !user) return;
    try {
      setSending(true);
      await api.post('/community/messages', { text: message.trim() });
      setMessage('');

      // reload messages, but don't show loading spinner
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
    console.log('Trying to open Zoom URL:', ZOOM_SPEAKING_URL);

    // simpler: just try to open it
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
          {/* Online + Zoom */}
          <View style={styles.topSection}>
            <Card style={styles.card} mode="elevated">
              <Card.Content>
                <Text style={styles.cardTitle}>Online learners</Text>
                <Text style={styles.cardSubtitle}>
                  যারা গত কয়েক মিনিটের মধ্যে এক্টিভ আছেন
                </Text>

                <View style={styles.onlineList}>
                  {onlineUsers.length === 0 ? (
                    <Text style={styles.onlineEmpty}>
                      এখন কেউ online নেই, একটু পর আবার চেষ্টা করুন।
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
                  চাইলে সবাই মিলে Live Zoom-এ যোগ দিয়ে জার্মান প্র্যাকটিস করতে
                  পারেন।
                </Text>

                {ZOOM_SPEAKING_URL ? (
                 <Button
  mode="contained"
  style={styles.zoomButton}
  contentStyle={styles.zoomButtonContent}
  onPress={openZoom}          // ✅ make sure it’s this
>
  Join Zoom Speaking Room
</Button>

                ) : (
                  <Text style={styles.zoomMissing}>
                    Zoom link সেট করা নেই। (ZOOM_SPEAKING_URL)
                  </Text>
                )}
              </Card.Content>
            </Card>
          </View>

          {/* Chat */}
          <Card style={styles.chatCard} mode="elevated">
            <Card.Content style={styles.chatCardContent}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatTitle}>Community Chat</Text>
                <Text style={styles.chatSubtitle}>Logged in as {meName}</Text>
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
                    এখনো কোনো মেসেজ নেই। প্রথম মেসেজটা তুমি শুরু করো 🙂
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
                />
                <Button
                  mode="contained"
                  style={styles.sendButton}
                  contentStyle={styles.sendButtonContent}
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EEF2FF',
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
  topSection: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 8,
  },
  onlineList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6 as any, // TS workaround if needed; or remove 'gap' if not supported
  },
  onlineEmpty: {
    fontSize: 12,
    color: '#9ca3af',
  },
  onlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    marginRight: 4,
    marginBottom: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 4,
  },
  onlineName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1f2937',
  },
  zoomCard: {
    borderRadius: 16,
    backgroundColor: '#4f46e5',
  },
  zoomTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  zoomText: {
    fontSize: 13,
    color: '#e0e7ff',
    marginBottom: 10,
  },
  zoomButton: {
    borderRadius: 999,
  },
  zoomButtonContent: {
    paddingVertical: 6,
  },
  zoomMissing: {
    fontSize: 11,
    color: '#fee2e2',
  },
  chatCard: {
    borderRadius: 16,
    minHeight: 320,
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
  chatTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  chatSubtitle: {
    fontSize: 11,
    color: '#6b7280',
  },
  chatMessagesWrapper: {
    flex: 1,
    minHeight: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 8,
  },
  chatLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  chatLoadingText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  chatEmptyText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 12,
  },
  chatListContent: {
    paddingBottom: 4,
  },
  messageRow: {
    marginBottom: 6,
    flexDirection: 'row',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  messageBubbleMe: {
    backgroundColor: '#4f46e5',
    borderTopRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderTopLeftRadius: 4,
  },
  messageSender: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 13,
    color: '#111827',
  },
  messageTime: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  input: {
    flex: 1,
    marginRight: 6,
  },
  sendButton: {
    borderRadius: 999,
  },
  sendButtonContent: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
