export function friendlyError(e: any): string {
  const msg = e?.response?.data?.error ?? e?.message ?? 'Bilinmeyen hata';
  return String(msg);
}
