import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { config } from './config.js';
import { POST } from './chat.js';

const app = new Hono();

app.use('*', logger());
app.use('/api/*', cors());

/**
 * Lightweight bearer-token guard.
 * Disabled when ORCHESTRATOR_API_TOKEN is empty (local development).
 * Replace with real auth middleware (JWT/session) before exposing publicly.
 */
app.use('/api/chat', async (c, next) => {
  if (config.apiToken) {
    const auth = c.req.header('authorization') ?? '';
    if (auth !== `Bearer ${config.apiToken}`) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
  }
  await next();
});

app.get('/api/health', (c) =>
  c.json({
    ok: true,
    model: config.modelId,
    cliToolEnabled: config.cliToolEnabled,
    authRequired: Boolean(config.apiToken),
  }),
);

// Hand the raw Web Request to the serverless-compatible handler.
app.post('/api/chat', (c) => POST(c.req.raw));

serve({ fetch: app.fetch, port: config.port, hostname: config.host }, (info) => {
  console.log(`KAT-Orchestrator gateway listening on http://${info.address}:${info.port}`);
  console.log(`  model: ${config.modelId}`);
  console.log(`  cli tool: ${config.cliToolEnabled ? 'enabled' : 'DISABLED'}`);
  console.log(`  auth: ${config.apiToken ? 'bearer token required' : 'OPEN (dev only!)'}`);
});
