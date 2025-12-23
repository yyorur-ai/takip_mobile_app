import Constants from 'expo-constants';

function normalize(v: string): string {
  return v.trim().replace(/\/$/, '');
}

function isPlaceholder(v: string): boolean {
  // Expo config interpolation placeholder like "${EXPO_PUBLIC_API_BASE}"
  return v.includes('${') || v.includes('EXPO_PUBLIC_');
}

export function getApiBase(): string {
  // Highest priority: EXPO_PUBLIC_API_BASE (works for dev + EAS builds)
  const envV = (process.env.EXPO_PUBLIC_API_BASE ?? '').toString();
  if (envV && !isPlaceholder(envV)) return normalize(envV);

  // Next: app.json -> expo.extra.apiBase
  const extra: any = Constants.expoConfig?.extra ?? {};
  const v = (extra.apiBase ?? '').toString();
  if (v && !isPlaceholder(v)) return normalize(v);

  // Final fallback: your production API base
  return 'https://wolinux.com.tr/takip/api';
}
