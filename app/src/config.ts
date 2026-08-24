import { Platform } from 'react-native';

/**
 * Where the AI gateway lives.
 *
 * - Expo Go / iOS simulator / web: localhost points at your machine.
 * - Android emulator: 10.0.2.2 is the alias for the host machine.
 * - Physical device: set EXPO_PUBLIC_CHAT_API_URL to your machine's LAN IP,
 *   e.g. `EXPO_PUBLIC_CHAT_API_URL=http://192.168.1.20:8081/api/chat npx expo start`
 */
const DEFAULT_API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8081/api/chat'
    : 'http://localhost:8081/api/chat';

export const CHAT_API_URL = process.env.EXPO_PUBLIC_CHAT_API_URL ?? DEFAULT_API_URL;

/** Optional bearer token shared with the gateway (ORCHESTRATOR_API_TOKEN). */
export const API_TOKEN = process.env.EXPO_PUBLIC_API_TOKEN ?? '';
