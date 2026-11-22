/** Identificativo univoco, con prefisso leggibile (es. "list_…", "task_…"). */
export function createId(prefix = 'id') {
  const random =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : Math.random().toString(36).slice(2, 14)
  return `${prefix}_${random}`
}

export const nowIso = () => new Date().toISOString()
