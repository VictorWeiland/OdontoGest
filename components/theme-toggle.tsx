"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Monitor, Moon, Sun } from "lucide-react"
import { useTheme, type ThemeMode } from "@/providers/theme-provider"
import { cn } from "@/lib/utils"

const THEME_OPTIONS: {
  value: ThemeMode
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
]

interface ThemeToggleProps {
  className?: string
  align?: "left" | "right"
  variant?: "dropdown" | "segmented"
  showLabel?: boolean
}

export function ThemeToggle({
  className,
  align = "right",
  variant = "dropdown",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  if (variant === "segmented") {
    return (
      <div
        role="radiogroup"
        aria-label="Selecionar tema"
        className={cn(
          "inline-flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-900/90",
          className
        )}
      >
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
          const isSelected = theme === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(value)}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-emerald-500",
                isSelected
                  ? "bg-white text-emerald-950 shadow-xs dark:bg-slate-800 dark:text-emerald-300"
                  : "text-slate-600 hover:text-emerald-800 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <Icon className="size-3.5 shrink-0" aria-hidden />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  const ActiveIcon =
    theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun
  const activeOption =
    THEME_OPTIONS.find((opt) => opt.value === theme) ?? THEME_OPTIONS[0]

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Alternar tema (atual: ${activeOption.label})`}
        title={`Tema: ${activeOption.label}`}
        className={cn(
          "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500/40 dark:hover:bg-slate-800 dark:hover:text-emerald-300",
          showLabel ? "px-3" : "w-9 px-0"
        )}
      >
        <ActiveIcon className="size-4 shrink-0" aria-hidden />
        {showLabel && <span>{activeOption.label}</span>}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Opções de tema"
          className={cn(
            "absolute top-full z-50 mt-2 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 dark:border-slate-700/80 dark:bg-slate-900 dark:ring-white/10",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
            const isSelected = theme === value
            return (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  setTheme(value)
                  setOpen(false)
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors",
                  isSelected
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  <span>{label}</span>
                </span>
                {isSelected && (
                  <Check
                    className="size-3.5 text-emerald-600 dark:text-emerald-400"
                    aria-hidden
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
