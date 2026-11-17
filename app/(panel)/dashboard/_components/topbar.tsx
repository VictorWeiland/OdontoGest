"use client"

import Link from "next/link"
import { CalendarPlus, ExternalLink, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TopbarProps {
  userName?: string | null
  userId?: string
  onOpenMobileMenu: () => void
}

export function Topbar({ userName, userId, onOpenMobileMenu }: TopbarProps) {
  const firstName = userName ? userName.split(" ")[0] : "Doutor(a)"

  // Data formatada de hoje em pt-BR
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date())

  const currentDateFormatted =
    formatted.charAt(0).toUpperCase() + formatted.slice(1)

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-600 hover:text-emerald-700 md:hidden"
          onClick={onOpenMobileMenu}
          aria-label="Abrir menu de navegação"
        >
          <Menu className="size-5" />
        </Button>

        <div>
          <h1 className="text-base font-bold text-emerald-950 sm:text-lg">
            Olá, {firstName} 👋
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            {currentDateFormatted}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {userId && (
          <Link
            href={`/clinica/${userId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:text-sm"
          >
            <CalendarPlus className="size-4" />
            <span className="hidden sm:inline">Novo agendamento</span>
            <span className="sm:hidden">Agendar</span>
            <ExternalLink className="hidden size-3.5 opacity-80 sm:inline" />
          </Link>
        )}
      </div>
    </header>
  )
}
