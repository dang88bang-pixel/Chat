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
    <View className="h-[60px] border-b border-edge flex-row items-center justify-between px-5">
      <Text className="text-primary text-base font-bold tracking-wide">
        KAT-Orchestrator v2.5
      </Text>
      <Animated.View
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: busy ? colors.busy : colors.success, opacity: pulse }}
      />
    </View>
  );
}

function EmptyState() {
  return (
    <View className="items-center mt-12 px-6">
      <Text className="text-primary text-lg font-bold mb-3">Native AI Orchestration</Text>
      <Text className="text-secondary text-[13px] leading-5 text-center">
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
    <View className={`my-2 max-w-[85%] ${isUser ? 'self-end' : 'self-start'}`}>
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
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Header busy={busy} />

        {/* Message Thread Scroll Window */}
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="py-5 px-4"
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 && <EmptyState />}
          {messages.map((message) => (
            <MessageRow key={message.id} message={message} />
          ))}
        </ScrollView>

        {error ? (
          <View className="mx-3 mb-1 bg-danger/15 border border-danger rounded-lg p-2">
            <Text className="text-error-text text-xs" numberOfLines={2}>
              {error.message}
            </Text>
          </View>
        ) : null}

        {/* Input Interactive Bar */}
        <View className="flex-row p-3 border-t border-edge bg-surface">
          <TextInput
            className="flex-1 h-[46px] bg-ai-bubble rounded-[23px] px-5 text-primary text-[15px]"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            placeholder="Run CLI commands or fetch APIs..."
            placeholderTextColor={colors.textMuted}
            editable={!busy}
            returnKeyType="send"
          />
          <TouchableOpacity
            className={`w-[46px] h-[46px] rounded-full justify-center items-center ml-2.5 ${
              busy || !input.trim() ? 'bg-disabled' : 'bg-primary'
            }`}
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
