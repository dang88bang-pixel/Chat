import { tool } from 'ai';
import { z } from 'zod';
import { config } from '../config.js';

/**
 * Hosts that should never be reachable from a model-issued request,
 * unless ALLOW_INTERNAL_NETWORKS=true (SSRF guard for metadata endpoints,
 * loopback and private ranges).
 */
function isInternalHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host === '::1' || host === '0.0.0.0') return true;
  if (host.endsWith('.local') || host.endsWith('.internal')) return true;
  if (host.startsWith('127.') || host.startsWith('169.254.')) return true;
  if (host.startsWith('10.') || host.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  return false;
}

/** TOOL 2: EXTERNAL API CALLING */
export const fetchExternalApi = tool({
  description: 'Dispatches custom REST network requests to integrated endpoints.',
  inputSchema: z.object({
    url: z.string().url().describe('Target API address'),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET'),
    body: z.string().optional().describe('Stringified JSON request body content'),
  }),
  execute: async ({ url, method, body }) => {
    let target: URL;
    try {
      target = new URL(url);
    } catch {
      return { error: `Invalid URL: ${url}` };
    }

    if (!config.allowInternalNetworks && isInternalHost(target.hostname)) {
      return {
        error: `Request blocked: ${target.hostname} is an internal/private address. ` +
          'Set ALLOW_INTERNAL_NETWORKS=true to permit it.',
      };
    }

    try {
      const response = await fetch(target, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(JSON.parse(body)) : undefined,
      });

      const contentType = response.headers.get('content-type') ?? '';
      const data = contentType.includes('json')
        ? await response.json()
        : await response.text();

      return { statusCode: response.status, data };
    } catch (error) {
      return {
        error: `Network transfer failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});
