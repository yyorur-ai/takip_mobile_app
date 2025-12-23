import { api } from './client';

export async function apiGet<T>(path: string, opts?: { auth?: boolean }) {
  const cfg: any = {};
  if (opts?.auth === false) cfg.headers = { Authorization: '' };
  const res = await api.get(path, cfg);
  return res.data as T;
}

export async function apiPost<T>(path: string, body?: any) {
  const res = await api.post(path, body ?? {});
  return res.data as T;
}

export async function apiPut<T>(path: string, body?: any) {
  const res = await api.put(path, body ?? {});
  return res.data as T;
}

export async function apiDelete<T>(path: string) {
  const res = await api.delete(path);
  return res.data as T;
}

export async function apiPostForm<T>(path: string, form: FormData) {
  const res = await api.post(path, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data as T;
}


export async function login(username: string, password: string) {
  const res = await apiPost<{ ok: true; token: string; user: any }>(`/auth/login`, { username, password });
  return { token: (res as any).token, user: (res as any).user };
}
