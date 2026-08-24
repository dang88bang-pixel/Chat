import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

export default function MessageBubble({ role, text }: { role: string; text: string }) {
  const isUser = role === 'user';
  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
      <Text style={styles.messageText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  userBubble: { backgroundColor: colors.userBubble, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: colors.aiBubble, borderBottomLeftRadius: 4 },
  messageText: { color: colors.textPrimary, fontSize: 15, lineHeight: 22 },
});
