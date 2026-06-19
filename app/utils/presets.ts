export interface Preset {
  id: string
  name: string
  description: string
  labels: string[]
  timestamp: number
  type: 'timer' | 'pomo'
  config: {
    // timer用
    hours?: number
    minutes?: number
    seconds?: number
    // pomo用
    workMin?: number
    shortMin?: number
    longMin?: number
    sets?: number
  }
}

const PRESETS_KEY = 'wt:presets'

export function loadPresets(): Preset[] {
  try {
    const data = localStorage.getItem(PRESETS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function savePresets(presets: Preset[]) {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
  } catch {}
}

export function addPreset(preset: Omit<Preset, 'id' | 'timestamp'>): Preset {
  const presets = loadPresets()
  const newPreset: Preset = {
    ...preset,
    id: `preset_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
  }
  presets.push(newPreset)
  savePresets(presets)
  return newPreset
}

export function updatePreset(id: string, updates: Partial<Omit<Preset, 'id' | 'timestamp'>>) {
  const presets = loadPresets()
  const idx = presets.findIndex(p => p.id === id)
  if (idx >= 0) {
    presets[idx] = { ...presets[idx], ...updates }
    savePresets(presets)
  }
}

export function deletePreset(id: string) {
  const presets = loadPresets()
  savePresets(presets.filter(p => p.id !== id))
}

export function getPresetsByType(type: 'timer' | 'pomo'): Preset[] {
  return loadPresets().filter(p => p.type === type)
}

export function getPresetsByLabel(label: string): Preset[] {
  return loadPresets().filter(p => p.labels.includes(label))
}

export function getAllLabels(): string[] {
  const presets = loadPresets()
  const labels = new Set<string>()
  presets.forEach(p => p.labels.forEach(l => labels.add(l)))
  return Array.from(labels).sort()
}
