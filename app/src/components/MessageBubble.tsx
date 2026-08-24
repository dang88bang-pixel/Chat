import React from 'react';
import { Text, View } from 'react-native';

export default function MessageBubble({ role, text }: { role: string; text: string }) {
  const isUser = role === 'user';
  return (
    <View
      className={`px-4 py-3 rounded-[20px] ${
        isUser ? 'bg-user-bubble rounded-br-[4px]' : 'bg-ai-bubble rounded-bl-[4px]'
      }`}
    >
      <Text className="text-primary text-[15px] leading-[22px]">{text}</Text>
    </View>
  );
}
