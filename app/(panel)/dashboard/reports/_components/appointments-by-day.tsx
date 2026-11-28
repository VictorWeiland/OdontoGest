"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ReportsData } from "../_data-access/get-reports-data"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { formatCurrency } from "@/utils/formatCurrency"
import { EmptyState } from "@/components/ui/empty-state"
import { CalendarDays } from "lucide-react"

function formatDayLabel(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number)
  const d = new Date(Date.UTC(year, month - 1, day))
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(d)
}

interface AppointmentsByDayProps {
  days: ReportsData["appointmentsByDay"]
}

export function AppointmentsByDay({ days }: AppointmentsByDayProps) {
  const chartData = days.map((day) => ({
    date: day.date,
    formattedDate: formatDayLabel(day.date),
    count: day.count,
    revenue: day.estimatedRevenueCents / 100,
  }))

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
        <CardTitle className="text-lg font-extrabold text-emerald-950 sm:text-xl dark:text-emerald-50">
          Agendamentos por Dia
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
          Volume diário de consultas agendadas pela plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {days.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Nenhum agendamento no período"
            description="Não encontramos consultas marcadas para os dias selecionados."
          />
        ) : (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                />
                <XAxis
                  dataKey="formattedDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(16, 185, 129, 0.08)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload
                      return (
                        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                          <p className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                            {item.formattedDate}
                          </p>
                          <p className="mt-1 text-xs text-emerald-700 font-semibold dark:text-emerald-400">
                            {item.count}{" "}
                            {item.count === 1 ? "agendamento" : "agendamentos"}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Faturamento est.: {formatCurrency(item.revenue)}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
