import { tool } from 'ai';
import { z } from 'zod';

/**
 * TOOL 3: CUSTOM SYSTEM SDK BRIDGE
 *
 * The registry below is the extension point for real SDK clients
 * (AWS, Firebase, internal microservices...). Register a handler per
 * `service` identifier; anything unregistered falls back to the mock
 * implementation so the orchestration loop stays demo-able.
 *
 * Example (later step):
 *   registerSdkHandler('s3', async (action, payload) => s3Client[action](payload));
 */
type SdkHandler = (action: string, payload: unknown) => Promise<unknown>;

const sdkHandlers = new Map<string, SdkHandler>();

export function registerSdkHandler(service: string, handler: SdkHandler): void {
  sdkHandlers.set(service, handler);
}

export const triggerSdkMethod = tool({
  description: 'Interacts with internal custom SDK clients or cloud resources.',
  inputSchema: z.object({
    service: z
      .string()
      .describe('The target system service identifier (e.g., s3, database, cache)'),
    action: z.string().describe('The SDK operational method to call'),
    payload: z
      .any()
      .describe('The configuration arguments block passed directly to the SDK'),
  }),
  execute: async ({ service, action, payload }) => {
    const handler = sdkHandlers.get(service);

    if (handler) {
      try {
        const result = await handler(action, payload);
        return { status: 'success', service, action, result };
      } catch (error) {
        return {
          status: 'error',
          service,
          action,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    // Mock SDK infrastructure representation (no live handler registered).
    console.log(`[SDK Triggered] Target: ${service} -> Action: ${action}`, payload);
    return {
      status: 'success',
      service,
      action,
      trackingId: Math.random().toString(36).substring(2, 10),
      mocked: true,
    };
  },
});
