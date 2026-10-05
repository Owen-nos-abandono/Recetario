export function extractErrorMessage(err: any, fallback: string): string {
  const detail = err?.error?.detail;
  if (!detail) return fallback;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    // Errores de validación de Pydantic/FastAPI
    return detail.map((d: any) => d.msg ?? JSON.stringify(d)).join(' | ');
  }
  return fallback;
}
