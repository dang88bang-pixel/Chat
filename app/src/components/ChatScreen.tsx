import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, isToolUIPart, type UIMessage } from 'ai';
import { Send } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { API_TOKEN, CHAT_API_URL } from '../config';
import { colors } from '../theme';
import MessageBubble from './MessageBubble';
import ToolCard from './ToolCard';

/** Core Header Navigation with a live status indicator. */
function Header({ busy }: { busy: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!busy) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.25, duration: 450, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [busy, pulse]);

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>KAT-Orchestrator v2.5</Text>
      <Animated.View
        style={[
          styles.statusIndicator,
          { backgroundColor: busy ? colors.busy : colors.success, opacity: pulse },
        ]}
      />
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Native AI Orchestration</Text>
      <Text style={styles.emptyHint}>
        Ask the orchestrator to run local CLI commands, call external REST APIs, or trigger
        SDK services.{'\n\n'}Try:{'\n'}• run git status in this repo{'\n'}• fetch
        https://api.github.com/repos/facebook/react-native{'\n'}• trigger cache service action
        flush
      </Text>
    </View>
  );
}

/** Renders one message: text bubbles plus any generative-UI tool capture logs. */
function MessageRow({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.messageBubbleContainer, isUser ? styles.userAlign : styles.aiAlign]}>
      {message.parts.map((part, index) => {
        if (part.type === 'text') {
          return <MessageBubble key={`text-${index}`} role={message.role} text={part.text} />;
        }
        if (isToolUIPart(part)) {
          return <ToolCard key={`tool-${part.toolCallId}`} part={part} />;
        }
        return null; // reasoning / source / step-start parts are not rendered on mobile yet
      })}
    </View>
  );
}

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: CHAT_API_URL,
        headers: API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : undefined,
      }),
    [],
  );

  // AI SDK UI hook, wired natively through the HTTP transport.
  const { messages, sendMessage, status, error, clearError } = useChat({ transport });

  const busy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, status]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    clearError();
    sendMessage({ text });
  }, [input, busy, sendMessage, clearError]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Header busy={busy} />

        {/* Message Thread Scroll Window */}
        <ScrollView
          ref={scrollRef}
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 && <EmptyState />}
          {messages.map((message) => (
            <MessageRow key={message.id} message={message} />
          ))}
        </ScrollView>

        {error ? (
          <View style={styles.errorBar}>
            <Text style={styles.errorText} numberOfLines={2}>
              {error.message}
            </Text>
          </View>
        ) : null}

        {/* Input Interactive Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputField}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            placeholder="Run CLI commands or fetch APIs..."
            placeholderTextColor={colors.textMuted}
            editable={!busy}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendButton, (busy || !input.trim()) && styles.disabledButton]}
            onPress={handleSend}
            disabled={busy || !input.trim()}
            accessibilityLabel="Send message"
          >
            <Send size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Custom Deep Dark UI Theme Colors & Typography Layout Stylesheet
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  keyboardView: { flex: 1 },
  header: {
    height: 60,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusIndicator: { width: 10, height: 10, borderRadius: 5 },
  scrollArea: { flex: 1 },
  scrollContent: { paddingVertical: 20, paddingHorizontal: 16 },
  emptyState: { alignItems: 'center', marginTop: 48, paddingHorizontal: 24 },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  emptyHint: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  messageBubbleContainer: { marginVertical: 8, maxWidth: '85%' },
  userAlign: { alignSelf: 'flex-end' },
  aiAlign: { alignSelf: 'flex-start' },
  errorBar: {
    marginHorizontal: 12,
    marginBottom: 4,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  errorText: { color: '#FCA5A5', fontSize: 12 },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  inputField: {
    flex: 1,
    height: 46,
    backgroundColor: colors.aiBubble,
    borderRadius: 23,
    paddingHorizontal: 20,
    color: colors.textPrimary,
    fontSize: 15,
  },
  sendButton: {
    width: 46,
    height: 46,
    backgroundColor: colors.textPrimary,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: { backgroundColor: colors.disabled },
});
