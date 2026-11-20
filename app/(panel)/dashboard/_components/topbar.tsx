"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarPlus, Check, ExternalLink, Link2, Menu } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useQuickAppointment } from "./quick-appointment/quick-appointment-modal"

interface TopbarProps {
  userName?: string | null
  userId?: string
  onOpenMobileMenu: () => void
}

export function Topbar({ userName, userId, onOpenMobileMenu }: TopbarProps) {
  const firstName = userName ? userName.split(" ")[0] : "Doutor(a)"
  const { openQuickAppointment } = useQuickAppointment()
  const [copied, setCopied] = useState(false)

  // Data formatada de hoje em pt-BR
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date())

  const currentDateFormatted =
    formatted.charAt(0).toUpperCase() + formatted.slice(1)

  async function handleCopyPublicLink() {
    if (!userId) return
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const url = `${origin}/clinica/${userId}`

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link da página pública copiado!")
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error("Não foi possível copiar o link.")
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-2 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-slate-600 hover:text-emerald-700 md:hidden"
          onClick={onOpenMobileMenu}
          aria-label="Abrir menu de navegação"
        >
          <Menu className="size-5" />
        </Button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-emerald-950 sm:text-lg">
            Olá, {firstName} 👋
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            {currentDateFormatted}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {userId && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyPublicLink}
              className="h-9 gap-1.5 rounded-xl border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 sm:px-3"
              aria-label="Copiar link da página pública"
              title="Copiar link da página pública"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-600" aria-hidden />
                  <span className="hidden sm:inline">Copiado!</span>
                </>
              ) : (
                <>
                  <Link2 className="size-3.5 text-slate-500" aria-hidden />
                  <span className="hidden lg:inline">
                    Copiar link da página pública
                  </span>
                  <span className="hidden sm:inline lg:hidden">Copiar link</span>
                </>
              )}
            </Button>

            <Link
              href={`/clinica/${userId}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir página pública"
              title="Abrir página pública"
              className="hidden h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 xl:inline-flex"
            >
              <span>Abrir página pública</span>
              <ExternalLink className="size-3.5 opacity-80" aria-hidden />
            </Link>
          </>
        )}

        <Button
          type="button"
          onClick={() => openQuickAppointment()}
          className="h-9 gap-2 rounded-xl bg-emerald-500 px-3.5 text-xs font-semibold text-white shadow-sm shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:px-4 sm:text-sm"
        >
          <CalendarPlus className="size-4" aria-hidden />
          <span className="hidden sm:inline">Agendamento rápido</span>
          <span className="sm:hidden">Agendar</span>
        </Button>
      </div>
    </header>
  )
}
