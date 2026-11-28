import { Card, CardContent } from "@/components/ui/card"
import type { ReportsData } from "../_data-access/get-reports-data"
import { CalendarDays, DollarSign, TrendingUp } from "lucide-react"

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

interface ReportsSummaryProps {
  data: ReportsData
}

export function ReportsSummary({ data }: ReportsSummaryProps) {
  const metrics = [
    {
      label: "Total de Agendamentos",
      value: data.appointmentCount.toLocaleString("pt-BR"),
      icon: CalendarDays,
      description: "Consultas marcadas no período",
      badgeColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    },
    {
      label: "Faturamento Estimado",
      value: currencyFormatter.format(data.estimatedRevenueCents / 100),
      icon: DollarSign,
      description: "Valor bruto com base na tabela",
      badgeColor: "bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400",
    },
    {
      label: "Ticket Médio por Consulta",
      value: currencyFormatter.format(data.averageTicketCents / 100),
      icon: TrendingUp,
      description: "Média estimada por agendamento",
      badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    },
  ]

  return (
    <section
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Resumo do período"
    >
      {metrics.map((metric) => {
        const Icon = metric.icon

        return (
          <Card
            key={metric.label}
            className="rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide dark:text-slate-400">
                  {metric.label}
                </span>
                <div
                  className={`flex size-10 items-center justify-center rounded-xl ${metric.badgeColor}`}
                >
                  <Icon className="size-5" />
                </div>
              </div>

              <div className="mt-3">
                <p className="text-2xl font-extrabold text-emerald-950 sm:text-3xl dark:text-emerald-50">
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {metric.description}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
