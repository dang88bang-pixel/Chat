import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { tool } from 'ai';
import { z } from 'zod';
import { config } from '../config.js';

const execPromise = promisify(exec);

/**
 * Security layer: catastrophic / irreversible command patterns.
 * NOTE: a blocklist can never be exhaustive — combine it with the optional
 * CLI_ALLOWLIST env var and the bearer-token guard for anything beyond
 * local development.
 */
const BLOCKED_PATTERNS = [
  'rm -rf',
  ':(){ :|:& };:', // fork bomb
  'mkfs',
  'dd if=',
  '> /dev/sd',
  '> /dev/disk',
  'chmod -R 777 /',
  'shutdown',
  'reboot',
  'init 0',
  'init 6',
];

function isBlocked(command: string): string | null {
  const normalized = command.toLowerCase();
  const hit = BLOCKED_PATTERNS.find((pattern) => normalized.includes(pattern));
  return hit ?? null;
}

function isAllowedByAllowlist(command: string): boolean {
  if (config.cliAllowlist.length === 0) return true;
  return config.cliAllowlist.some((prefix) => command.startsWith(prefix));
}

/** TOOL 1: SECURE CLI EXECUTION */
export const executeCliCommand = tool({
  description:
    'Executes approved local CLI terminal commands on the host machine ' +
    '(e.g. git status, docker ps, custom scripts).',
  inputSchema: z.object({
    command: z
      .string()
      .describe('The shell command to run (e.g., git status, docker ps, custom scripts)'),
  }),
  execute: async ({ command }) => {
    if (!config.cliToolEnabled) {
      return { error: 'CLI tool is disabled on this host (ENABLE_CLI_TOOL=false).' };
    }

    const blocked = isBlocked(command);
    if (blocked) {
      return { error: `Command rejected: Security restriction violation (matched "${blocked}").` };
    }

    if (!isAllowedByAllowlist(command)) {
      return {
        error: `Command rejected: not on the CLI_ALLOWLIST (${config.cliAllowlist.join(', ')}).`,
      };
    }

    try {
      const { stdout, stderr } = await execPromise(command, {
        timeout: config.cliTimeoutMs,
        maxBuffer: 1024 * 1024, // 1 MB
      });
      return { output: stdout || stderr || '(no output)' };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  },
});
