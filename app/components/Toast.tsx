'use client'

interface ToastProps {
  msg: string
  color: string
  visible: boolean
}

export default function Toast({ msg, color, visible }: ToastProps) {
  return (
    <div className={`toast${visible ? ' show' : ''}`}>
      <span className="toast-dot" style={{ background: color }} />
      <span>{msg}</span>
    </div>
  )
}
