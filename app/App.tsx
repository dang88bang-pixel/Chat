import './global.css';

import { StatusBar } from 'expo-status-bar';
import React from 'react';

import ChatScreen from './src/components/ChatScreen';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <ChatScreen />
    </>
  );
}
