"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Filter } from "lucide-react"

interface ReportsDateFilterProps {
  startDate: string
  endDate: string
}

function formatDateToIso(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function ReportsDateFilter({
  startDate,
  endDate,
}: ReportsDateFilterProps) {
  const router = useRouter()
  const [selectedStartDate, setSelectedStartDate] = useState(startDate)
  const [selectedEndDate, setSelectedEndDate] = useState(endDate)

  function applyFilter(start: string, end: string) {
    const url = new URL(window.location.href)
    url.searchParams.set("startDate", start)
    url.searchParams.set("endDate", end)
    router.push(url.toString())
  }

  function handleQuickFilter(days: number) {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - (days - 1))

    const startStr = formatDateToIso(start)
    const endStr = formatDateToIso(end)

    setSelectedStartDate(startStr)
    setSelectedEndDate(endStr)
    applyFilter(startStr, endStr)
  }

  function handleCurrentMonth() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    const start = new Date(Date.UTC(year, month, 1))
    const end = new Date(Date.UTC(year, month + 1, 0))

    const startStr = formatDateToIso(start)
    const endStr = formatDateToIso(end)

    setSelectedStartDate(startStr)
    setSelectedEndDate(endStr)
    applyFilter(startStr, endStr)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    applyFilter(selectedStartDate, selectedEndDate)
  }

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Filtros Rápidos em 1 clique */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1 hidden sm:inline dark:text-slate-400">
              Período:
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter(7)}
              className="rounded-xl text-xs font-medium border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-slate-700 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-300"
            >
              Últimos 7 dias
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter(30)}
              className="rounded-xl text-xs font-medium border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-slate-700 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-300"
            >
              Últimos 30 dias
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCurrentMonth}
              className="rounded-xl text-xs font-medium border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-slate-700 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-300"
            >
              Este mês
            </Button>
          </div>

          {/* Seleção Personalizada de Datas */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-wrap items-center gap-2.5 sm:gap-3"
          >
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium dark:text-slate-400">De:</label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedStartDate}
                  onChange={(e) => setSelectedStartDate(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-800"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium dark:text-slate-400">Até:</label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedEndDate}
                  onChange={(e) => setSelectedEndDate(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-800"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="sm"
              className="gap-1.5 rounded-xl bg-emerald-500 font-semibold text-white hover:bg-emerald-600 shadow-xs"
            >
              <Filter className="size-3.5" />
              <span>Filtrar</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
