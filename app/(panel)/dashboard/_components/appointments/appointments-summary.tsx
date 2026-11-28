import { CalendarDays, Clock, DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/utils/formatCurrency"
import type { AppointmentWithService } from "./appoitments-list"

interface AppointmentsSummaryProps {
  appointments: AppointmentWithService[]
  selectedDate: string
}

export function AppointmentsSummary({
  appointments,
  selectedDate,
}: AppointmentsSummaryProps) {
  const totalCount = appointments.length

  const totalRevenue = appointments.reduce((acc, curr) => {
    return acc + (curr.service?.price || 0) / 100
  }, 0)

  // Próximos agendamentos hoje
  const now = new Date()
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(now)

  const isToday = selectedDate === todayStr
  const currentHourMinute = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`

  const upcomingCount = isToday
    ? appointments.filter((a) => a.time >= currentHourMinute).length
    : appointments.length

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="flex items-center gap-3.5 p-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <CalendarDays className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Agendamentos</p>
            <p className="text-xl font-extrabold text-emerald-950 dark:text-emerald-50">{totalCount}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="flex items-center gap-3.5 p-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400">
            <Clock className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isToday ? "Próximos hoje" : "Previstos"}
            </p>
            <p className="text-xl font-extrabold text-emerald-950 dark:text-emerald-50">
              {upcomingCount}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="flex items-center gap-3.5 p-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <DollarSign className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Faturamento estimado</p>
            <p className="text-xl font-extrabold text-emerald-950 dark:text-emerald-50">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
