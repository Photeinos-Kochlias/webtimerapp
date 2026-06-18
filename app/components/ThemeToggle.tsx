"use client"

import React, { useEffect, useState } from "react"
import { useTheme } from "./ThemeProvider"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const title = mounted ? (theme === "dark" ? "ライトテーマへ切替" : "ダークテーマへ切替") : "Toggle theme"

  return (
    <button
      aria-label="Toggle theme"
      className="btn btn-icon"
      onClick={toggleTheme}
      title={title}
    >
      {!mounted ? (
        <svg className="ico" viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <circle cx="12" cy="12" r="5" />
        </svg>
      ) : theme === "dark" ? (
        <svg className="ico" viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      ) : (
        <svg className="ico" viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      )}
    </button>
  )
}

export default ThemeToggle
