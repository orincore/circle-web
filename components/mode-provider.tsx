"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type ModeType = "friendship" | "dating"

interface ModeContextType {
  mode: ModeType
  setMode: (mode: ModeType) => void
}

const ModeContext = createContext<ModeContextType | undefined>(undefined)

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ModeType>("friendship")
  const [mounted, setMounted] = useState(false)

  // Update the document body class when the mode changes
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    if (mode === "dating") {
      root.classList.add("mode-dating")
    } else {
      root.classList.remove("mode-dating")
    }

    // Save to localStorage
    localStorage.setItem("circle-mode", mode)
  }, [mode, mounted])

  // Load the mode from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedMode = localStorage.getItem("circle-mode") as ModeType | null
    if (savedMode) {
      setMode(savedMode)
    }
  }, [])

  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>
}

export function useMode() {
  const context = useContext(ModeContext)
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider")
  }
  return context
}

