"use client"

import { Toaster } from "sonner"
import { useTheme } from "@/providers/theme-provider"

export function ThemedToaster() {
  const { resolvedTheme } = useTheme()
  return <Toaster theme={resolvedTheme} duration={2500} />
}
