import 'dotenv/config';

/**
 * Central runtime configuration.
 * Every knob can be overridden via environment variables (see server/.env.example).
 */
export const config = {
  /** OpenRouter API key used to reach KAT-Coder-Air V2.5. */
  openrouterApiKey: process.env.OPENROUTER_API_KEY ?? '',

  /** Model routed through the OpenAI-compatible OpenRouter layer. */
  modelId: process.env.CHAT_MODEL ?? 'kwaipilot/kat-coder-air-v2.5',

  /** How many model<->tool round trips a single chat turn may take. */
  maxToolSteps: Number(process.env.MAX_TOOL_STEPS ?? 6),

  /** HTTP server binding. 0.0.0.0 so devices on your LAN / Expo dev builds can reach it. */
  host: process.env.HOST ?? '0.0.0.0',
  port: Number(process.env.PORT ?? 8081),

  /**
   * Optional bearer token guarding /api/chat.
   * When set, clients must send `Authorization: Bearer <token>`.
   * When empty, the endpoint is open (local development only!).
   */
  apiToken: process.env.ORCHESTRATOR_API_TOKEN ?? '',

  /** CLI tool switches. */
  cliToolEnabled: process.env.ENABLE_CLI_TOOL !== 'false',
  /**
   * Optional comma-separated allowlist of command prefixes, e.g. "git ,docker ,npm run".
   * When non-empty, only commands starting with one of these prefixes may run.
   */
  cliAllowlist: (process.env.CLI_ALLOWLIST ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean),
  cliTimeoutMs: Number(process.env.CLI_TIMEOUT_MS ?? 30_000),

  /** Set to "true" to let fetchExternalApi reach localhost/private ranges. */
  allowInternalNetworks: process.env.ALLOW_INTERNAL_NETWORKS === 'true',
};
