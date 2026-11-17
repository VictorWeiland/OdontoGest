"use client"

import { ChangeEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

function getTodayString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date())
}

function adjustDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return date.toISOString().slice(0, 10)
}

export function ButtonPickerAppointment() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const todayStr = getTodayString()
  const currentDate = searchParams.get("date") || todayStr

  function updateDateParam(newDate: string) {
    const url = new URL(window.location.href)
    url.searchParams.set("date", newDate)
    router.push(url.toString())
  }

  function handleChangeDate(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.value) {
      updateDateParam(event.target.value)
    }
  }

  function handlePrevDay() {
    updateDateParam(adjustDays(currentDate, -1))
  }

  function handleNextDay() {
    updateDateParam(adjustDays(currentDate, 1))
  }

  function handleGoToday() {
    updateDateParam(todayStr)
  }

  const isCurrentToday = currentDate === todayStr

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      <Button
        type="button"
        variant={isCurrentToday ? "default" : "outline"}
        size="sm"
        onClick={handleGoToday}
        className="rounded-xl px-3 text-xs font-semibold"
      >
        Hoje
      </Button>

      <div className="flex items-center rounded-xl border border-slate-200 bg-white shadow-2xs">
        <button
          type="button"
          onClick={handlePrevDay}
          title="Dia anterior"
          className="inline-flex size-8 items-center justify-center rounded-l-xl text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition-colors"
          aria-label="Dia anterior"
        >
          <ChevronLeft className="size-4" />
        </button>

        <label className="relative flex items-center px-1">
          <Calendar className="pointer-events-none absolute left-2 size-3.5 text-slate-400" />
          <input
            type="date"
            value={currentDate}
            onChange={handleChangeDate}
            className="h-8 cursor-pointer rounded-lg border-0 bg-transparent py-1 pr-2 pl-7 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-0"
            aria-label="Selecione o dia"
          />
        </label>

        <button
          type="button"
          onClick={handleNextDay}
          title="Próximo dia"
          className="inline-flex size-8 items-center justify-center rounded-r-xl text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition-colors"
          aria-label="Próximo dia"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
