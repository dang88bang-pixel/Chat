declare namespace NodeJS {
  interface ProcessEnv {
    /** Gateway endpoint, e.g. http://192.168.1.20:8081/api/chat */
    EXPO_PUBLIC_CHAT_API_URL?: string;
    /** Bearer token shared with ORCHESTRATOR_API_TOKEN on the gateway. */
    EXPO_PUBLIC_API_TOKEN?: string;
  }
}
