'use client'

import { useState, useCallback } from 'react'
import { Preset, loadPresets, addPreset, deletePreset, updatePreset, getAllLabels } from '../utils/presets'

interface PresetManagerProps {
  type: 'timer' | 'pomo'
  onLoad: (preset: Preset) => void
  onSave: (config: any) => void
}

export default function PresetManager({ type, onLoad, onSave }: PresetManagerProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [saveForm, setSaveForm] = useState({ name: '', description: '', labels: '' })
  const [presets, setPresets] = useState<Preset[]>([])
  const [filterLabel, setFilterLabel] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', labels: '' })

  const allLabels = getAllLabels()
  const typePresets = loadPresets().filter(p => p.type === type)
  const filtered = filterLabel ? typePresets.filter(p => p.labels.includes(filterLabel)) : typePresets

  const handleOpenSaveDialog = () => {
    setSaveForm({ name: '', description: '', labels: '' })
    setShowSaveDialog(true)
  }

  const handleSavePreset = () => {
    if (!saveForm.name.trim()) {
      alert('プリセット名を入力してください')
      return
    }
    const labels = saveForm.labels
      .split(',')
      .map(l => l.trim())
      .filter(l => l.length > 0)
    const config = onSave()
    addPreset({
      name: saveForm.name,
      description: saveForm.description,
      labels,
      type,
      config,
    })
    setSaveForm({ name: '', description: '', labels: '' })
    setShowSaveDialog(false)
  }

  const handleOpenLoadDialog = () => {
    setPresets(loadPresets().filter(p => p.type === type))
    setShowLoadDialog(true)
  }

  const handleLoadPreset = (preset: Preset) => {
    onLoad(preset)
    setShowLoadDialog(false)
  }

  const handleDeletePreset = (id: string) => {
    if (confirm('このプリセットを削除しますか？')) {
      deletePreset(id)
      setPresets(presets.filter(p => p.id !== id))
    }
  }

  const handleStartEdit = (preset: Preset) => {
    setEditingId(preset.id)
    setEditForm({
      name: preset.name,
      description: preset.description,
      labels: preset.labels.join(', '),
    })
  }

  const handleSaveEdit = (id: string) => {
    const labels = editForm.labels
      .split(',')
      .map(l => l.trim())
      .filter(l => l.length > 0)
    updatePreset(id, {
      name: editForm.name,
      description: editForm.description,
      labels,
    })
    setPresets(presets.map(p => p.id === id ? { ...p, name: editForm.name, description: editForm.description, labels } : p))
    setEditingId(null)
  }

  return (
    <div className="preset-manager">
      <div className="preset-buttons">
        <button className="btn" onClick={handleOpenSaveDialog} title="現在の設定をプリセットとして保存">
          <svg className="ico" viewBox="0 0 24 24">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 5 7 3 12 3" />
          </svg>
          保存
        </button>
        <button className="btn" onClick={handleOpenLoadDialog} title="保存したプリセットを読み込む">
          <svg className="ico" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          読込
        </button>
      </div>

      {showSaveDialog && (
        <div className="modal-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>プリセットを保存</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>プリセット名 *</label>
                <input
                  type="text"
                  value={saveForm.name}
                  onChange={e => setSaveForm({ ...saveForm, name: e.target.value })}
                  placeholder="例：集中用、軽い作業用"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>説明</label>
                <textarea
                  value={saveForm.description}
                  onChange={e => setSaveForm({ ...saveForm, description: e.target.value })}
                  placeholder="このプリセットの用途などを記入（省略可）"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>ラベル</label>
                <input
                  type="text"
                  value={saveForm.labels}
                  onChange={e => setSaveForm({ ...saveForm, labels: e.target.value })}
                  placeholder="カンマ区切り例：集中, 仕事, 重要"
                />
              </div>
              <div className="modal-buttons">
                <button className="btn" onClick={() => setShowSaveDialog(false)}>キャンセル</button>
                <button className="btn btn-primary" onClick={handleSavePreset}>保存</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLoadDialog && (
        <div className="modal-overlay" onClick={() => setShowLoadDialog(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>プリセットを読み込む</h3>
            {allLabels.length > 0 && (
              <div className="label-filters">
                <button
                  className={`label-tag${filterLabel === null ? ' active' : ''}`}
                  onClick={() => setFilterLabel(null)}
                >
                  すべて
                </button>
                {allLabels.map(label => (
                  <button
                    key={label}
                    className={`label-tag${filterLabel === label ? ' active' : ''}`}
                    onClick={() => setFilterLabel(filterLabel === label ? null : label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {filtered.length === 0 ? (
              <p className="empty-state">保存したプリセットがありません</p>
            ) : (
              <div className="presets-list">
                {filtered.map(preset => (
                  <div key={preset.id} className="preset-item">
                    {editingId === preset.id ? (
                      <div className="preset-edit">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          className="edit-input"
                        />
                        <textarea
                          value={editForm.description}
                          onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                          className="edit-input"
                          rows={2}
                        />
                        <input
                          type="text"
                          value={editForm.labels}
                          onChange={e => setEditForm({ ...editForm, labels: e.target.value })}
                          className="edit-input"
                          placeholder="ラベル（カンマ区切り）"
                        />
                        <div className="edit-buttons">
                          <button className="btn btn-small" onClick={() => setEditingId(null)}>キャンセル</button>
                          <button className="btn btn-small btn-primary" onClick={() => handleSaveEdit(preset.id)}>保存</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="preset-header" onClick={() => handleLoadPreset(preset)}>
                          <div className="preset-title">{preset.name}</div>
                          {preset.description && <div className="preset-desc">{preset.description}</div>}
                          {preset.labels.length > 0 && (
                            <div className="preset-labels">
                              {preset.labels.map(label => (
                                <span key={label} className="label-badge">{label}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="preset-actions">
                          <button
                            className="btn-icon"
                            onClick={() => handleStartEdit(preset)}
                            title="編集"
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDeletePreset(preset.id)}
                            title="削除"
                          >
                            <svg viewBox="0 0 24 24">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="modal-buttons">
              <button className="btn" onClick={() => setShowLoadDialog(false)}>閉じる</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
