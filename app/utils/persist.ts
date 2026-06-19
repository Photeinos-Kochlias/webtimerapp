export function saveState(key: string, obj: unknown) {
  try {
    localStorage.setItem(`wt:${key}`, JSON.stringify(obj))
  } catch (e) {
    // ignore
  }
}

export function loadState<T = any>(key: string): T | null {
  try {
    const s = localStorage.getItem(`wt:${key}`)
    return s ? JSON.parse(s) as T : null
  } catch (e) {
    return null
  }
}

export const now = () => Date.now()
