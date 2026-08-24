import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { config } from './config.js';
import { executeCliCommand } from './tools/cli.js';
import { fetchExternalApi } from './tools/api.js';
import { triggerSdkMethod } from './tools/sdk.js';

/**
 * Initialize KAT-Coder-Air V2.5 through OpenRouter's OpenAI-compatible layer.
 * NOTE: OpenRouter requires the `/api/v1` path on the base URL.
 */
const openrouter = createOpenAI({
  name: 'openrouter',
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: config.openrouterApiKey,
});

const SYSTEM_PROMPT =
  'You are a native core system orchestrator. You have direct access to local system CLIs, ' +
  'network SDKs, and custom internal APIs via tools. ' +
  'When a task requires system interaction, prefer calling the appropriate tool over guessing, ' +
  'and summarize tool results concisely for the mobile client.';

/**
 * POST /api/chat
 *
 * Serverless-compatible signature (Web Request -> Web Response), so the same
 * handler can be dropped into a Next.js/Vercel route or served by the local
 * Hono server in src/index.ts.
 *
 * Routes the incoming chat history to KAT-Coder-Air V2.5, processes automated
 * tool calls (CLI / external API / SDK bridge), and streams the JSON data
 * stream back to the client.
 */
export async function POST(req: Request): Promise<Response> {
  if (!config.openrouterApiKey) {
    return Response.json(
      { error: 'OPENROUTER_API_KEY is not set. Add it to server/.env and restart.' },
      { status: 500 },
    );
  }

  const { messages } = (await req.json()) as { messages: UIMessage[] };

  const result = streamText({
    // .chat() pins the stable /chat/completions path — OpenRouter's
    // /responses endpoint is still beta and has weaker tool-calling support.
    model: openrouter.chat(config.modelId),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    // Allow several model <-> tool round trips per user turn.
    stopWhen: stepCountIs(config.maxToolSteps),
    tools: {
      executeCliCommand,
      fetchExternalApi,
      triggerSdkMethod,
    },
    onError: ({ error }) => {
      console.error('[chat] stream error:', error);
    },
  });

  return result.toUIMessageStreamResponse();
}
