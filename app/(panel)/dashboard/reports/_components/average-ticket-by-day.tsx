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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { formatCurrency } from "@/utils/formatCurrency"
import { EmptyState } from "@/components/ui/empty-state"
import { TrendingUp } from "lucide-react"

function formatDayLabel(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number)
  const d = new Date(Date.UTC(year, month - 1, day))
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(d)
}

interface AverageTicketByDayProps {
  days: ReportsData["appointmentsByDay"]
}

export function AverageTicketByDay({ days }: AverageTicketByDayProps) {
  const chartData = days.map((day) => ({
    date: day.date,
    formattedDate: formatDayLabel(day.date),
    averageTicket: day.averageTicketCents / 100,
    count: day.count,
  }))

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-lg font-extrabold text-emerald-950 sm:text-xl">
          Ticket Médio por Dia
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Evolução do valor médio estimado por agendamento ao longo do tempo.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {days.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="Sem dados de ticket médio"
            description="Não houve agendamentos no período para calcular o ticket médio."
          />
        ) : (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="ticketGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="formattedDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(val) => `R$${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload
                      return (
                        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                          <p className="text-xs font-bold text-emerald-950">
                            {item.formattedDate}
                          </p>
                          <p className="mt-1 text-sm font-extrabold text-emerald-600">
                            {formatCurrency(item.averageTicket)}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Base: {item.count}{" "}
                            {item.count === 1 ? "agendamento" : "agendamentos"}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="averageTicket"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#ticketGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
