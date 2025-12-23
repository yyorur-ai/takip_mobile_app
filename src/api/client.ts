import axios from 'axios';
import { getApiBase } from '@/utils/env';

let token: string | null = null;

export function setToken(t: string | null) {
  token = t;
}

export const api = axios.create({
  baseURL: getApiBase(),
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getRootFromApiBase(): string {
  const base = getApiBase().replace(/\/$/, '');
  // .../takip/api  => .../takip
  return base.replace(/\/api$/, '');
}
