import { Cpu, Globe, Terminal } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import {
  getToolName,
  isDynamicToolUIPart,
  type DynamicToolUIPart,
  type ToolUIPart,
  type UITools,
} from 'ai';

import { colors } from '../theme';

type AnyToolPart = ToolUIPart<UITools> | DynamicToolUIPart;

const TOOL_META: Record<string, { icon: 'terminal' | 'cpu' | 'globe'; color: string }> = {
  executeCliCommand: { icon: 'terminal', color: '#4ADE80' },
  triggerSdkMethod: { icon: 'cpu', color: '#60A5FA' },
  fetchExternalApi: { icon: 'globe', color: '#FBBF24' },
};

function ToolIcon({ toolName }: { toolName: string }) {
  const meta = TOOL_META[toolName] ?? { icon: 'cpu' as const, color: colors.textSecondary };
  if (meta.icon === 'terminal') return <Terminal size={16} color={meta.color} />;
  if (meta.icon === 'globe') return <Globe size={16} color={meta.color} />;
  return <Cpu size={16} color={meta.color} />;
}

function prettifyToolName(toolName: string): string {
  return toolName.replace(/([A-Z])/g, ' $1').trim();
}

function preview(value: unknown, maxLength = 160): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

/**
 * GENERATIVE UI TOOL CAPTURE LOG
 * Renders live status for every CLI / API / SDK tool invocation streamed
 * back from the gateway.
 */
export default function ToolCard({ part }: { part: AnyToolPart }) {
  const toolName = isDynamicToolUIPart(part) ? part.toolName : getToolName(part);

  return (
    <View style={styles.toolCard}>
      <View style={styles.toolHeaderRow}>
        <ToolIcon toolName={toolName} />
        <Text style={styles.toolTitle}>{prettifyToolName(toolName)}</Text>
      </View>

      <Text style={styles.toolArguments} numberOfLines={3}>
        Args: {preview(part.input)}
      </Text>

      {part.state === 'output-available' ? (
        <View style={[styles.toolBadge, styles.toolBadgeSuccess]}>
          <Text style={styles.toolBadgeText}>
            Result: {preview(part.output)}
          </Text>
        </View>
      ) : part.state === 'output-error' ? (
        <View style={[styles.toolBadge, styles.toolBadgeError]}>
          <Text style={styles.toolBadgeText}>
            Failed: {preview(part.errorText)}
          </Text>
        </View>
      ) : (
        <View style={styles.toolBadge}>
          <ActivityIndicator size="small" color="#fff" style={styles.spinner} />
          <Text style={styles.toolBadgeText}>Orchestrating system resource...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toolCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    width: 280,
  },
  toolHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  toolTitle: { color: '#F3F4F6', fontSize: 13, fontWeight: '600', marginLeft: 8 },
  toolArguments: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  toolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.badgeBg,
    padding: 6,
    borderRadius: 6,
  },
  toolBadgeSuccess: { borderColor: colors.success, borderWidth: 1 },
  toolBadgeError: { borderColor: colors.danger, borderWidth: 1 },
  spinner: { marginRight: 8 },
  toolBadgeText: { color: '#E5E7EB', fontSize: 11, fontWeight: '500', flexShrink: 1 },
});
