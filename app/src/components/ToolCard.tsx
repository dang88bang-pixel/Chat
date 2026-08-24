import { Cpu, Globe, Terminal } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import {
  getToolName,
  isDynamicToolUIPart,
  type DynamicToolUIPart,
  type ToolUIPart,
  type UITools,
} from 'ai';

type AnyToolPart = ToolUIPart<UITools> | DynamicToolUIPart;

const TOOL_META: Record<string, { icon: 'terminal' | 'cpu' | 'globe'; color: string }> = {
  executeCliCommand: { icon: 'terminal', color: '#4ADE80' },
  triggerSdkMethod: { icon: 'cpu', color: '#60A5FA' },
  fetchExternalApi: { icon: 'globe', color: '#FBBF24' },
};

function ToolIcon({ toolName }: { toolName: string }) {
  const meta = TOOL_META[toolName] ?? { icon: 'cpu' as const, color: '#9CA3AF' };
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
    <View className="bg-card rounded-xl p-3 mt-2 border border-edge-light w-[280px]">
      <View className="flex-row items-center mb-1.5">
        <ToolIcon toolName={toolName} />
        <Text className="text-tool-title text-[13px] font-semibold ml-2">
          {prettifyToolName(toolName)}
        </Text>
      </View>

      <Text className="text-secondary text-[11px] font-mono mb-2" numberOfLines={3}>
        Args: {preview(part.input)}
      </Text>

      {part.state === 'output-available' ? (
        <View className="flex-row items-center bg-badge p-1.5 rounded-md border border-success">
          <Text className="text-badge-text text-[11px] font-medium shrink">
            Result: {preview(part.output)}
          </Text>
        </View>
      ) : part.state === 'output-error' ? (
        <View className="flex-row items-center bg-badge p-1.5 rounded-md border border-danger">
          <Text className="text-badge-text text-[11px] font-medium shrink">
            Failed: {preview(part.errorText)}
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center bg-badge p-1.5 rounded-md">
          <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
          <Text className="text-badge-text text-[11px] font-medium shrink">
            Orchestrating system resource...
          </Text>
        </View>
      )}
    </View>
  );
}
