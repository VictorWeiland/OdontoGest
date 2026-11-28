import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ReportsData } from "../_data-access/get-reports-data"
import { formatCurrency } from "@/utils/formatCurrency"
import { EmptyState } from "@/components/ui/empty-state"
import { Stethoscope, Trophy } from "lucide-react"

interface TopServicesProps {
  services: ReportsData["services"]
}

export function TopServices({ services }: TopServicesProps) {
  const maxCount = Math.max(...services.map((s) => s.appointmentCount), 1)

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs xl:col-span-2 dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-amber-500" />
          <CardTitle className="text-lg font-extrabold text-emerald-950 sm:text-xl dark:text-emerald-50">
            Serviços Mais Agendados
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
          Ranking dos procedimentos com maior procura e receita estimada no período.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {services.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="Nenhum serviço agendado"
            description="Não houve agendamentos registrados no período selecionado."
          />
        ) : (
          <div className="space-y-4">
            {services.map((service, index) => {
              const percentage = Math.round((service.appointmentCount / maxCount) * 100)

              return (
                <div
                  key={service.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all duration-150 hover:border-emerald-200 hover:bg-emerald-50/20 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-950/30"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                          index === 0
                            ? "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"
                            : index === 1
                            ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                            : index === 2
                            ? "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-50">
                          {service.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {service.appointmentCount}{" "}
                          {service.appointmentCount === 1
                            ? "agendamento"
                            : "agendamentos"}{" "}
                          • {service.durationMinutes} min de atendimento
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <span className="text-[10px] text-slate-400 block leading-none dark:text-slate-500">
                        Receita estimada
                      </span>
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(service.estimatedRevenueCents / 100)}
                      </span>
                    </div>
                  </div>

                  {/* Barra proporcional */}
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
