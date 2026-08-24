/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './index.ts', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Deep dark theme palette — keep in sync with src/theme.ts
      colors: {
        bg: '#0B0F19',
        surface: '#0F172A',
        card: '#111827',
        edge: '#1E293B',
        'edge-light': '#374151',
        'ai-bubble': '#1E293B',
        'user-bubble': '#3B82F6',
        primary: '#F8FAFC',
        secondary: '#9CA3AF',
        muted: '#666666',
        success: '#10B981',
        busy: '#F59E0B',
        danger: '#EF4444',
        badge: '#1F2937',
        disabled: '#475569',
        'tool-title': '#F3F4F6',
        'badge-text': '#E5E7EB',
        'error-text': '#FCA5A5',
        'cli-icon': '#4ADE80',
        'sdk-icon': '#60A5FA',
        'api-icon': '#FBBF24',
      },
    },
  },
  plugins: [],
};
