import { redirect } from "next/navigation"
import getSession from "@/lib/getSession"
import prisma from "@/lib/prisma"
import { getPermissionUserToReports } from "./_data-access/get-permission-reports"
import { getReportsData } from "./_data-access/get-reports-data"
import { AverageTicketByDay } from "./_components/average-ticket-by-day"
import { AppointmentsByDay } from "./_components/appointments-by-day"
import { ReportsDateFilter } from "./_components/reports-date-filter"
import { ReportsSummary } from "./_components/reports-summary"
import { TopServices } from "./_components/top-services"
import {
  BarChart3,
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type ReportsSearchParams = {
  startDate?: string | string[]
  endDate?: string | string[]
}

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function getDefaultDateRange(timeZone: string | null) {
  const dateParts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: timeZone ?? "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date())
      .map(({ type, value }) => [type, value])
  )
  const today = `${dateParts.year}-${dateParts.month}-${dateParts.day}`
  const lastDayOfMonth = new Date(
    Date.UTC(Number(dateParts.year), Number(dateParts.month), 0)
  )
    .toISOString()
    .slice(0, 10)

  return {
    startDate: `${today.slice(0, 7)}-01`,
    endDate: lastDayOfMonth,
  }
}

export default async function Reports({
  searchParams,
}: {
  searchParams: Promise<ReportsSearchParams>
}) {
  const session = await getSession()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const hasPermission = await getPermissionUserToReports({
    userId: session.user.id,
  })

  // Tela de Upgrade para usuários sem permissão (Plano Básico ou Trial expirado)
  if (!hasPermission) {
    return (
      <div className="mx-auto max-w-4xl py-6 sm:py-10">
        <div className="overflow-hidden rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/40 p-6 sm:p-10 shadow-xs dark:border-emerald-500/30 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/20">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
              <BarChart3 className="size-7" />
            </div>

            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
              <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              Recurso Exclusivo do Plano Profissional
            </span>

            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl dark:text-emerald-50">
              Desbloqueie os Relatórios Avançados da sua Clínica
            </h2>

            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
              Tome decisões baseadas em dados reais: acompanhe o faturamento
              estimado, os dias de maior movimento e os procedimentos mais
              lucrativos.
            </p>

            {/* Benefícios */}
            <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
              {[
                "Gráficos diários de agendamentos e horários de pico",
                "Evolução do faturamento e ticket médio estimado",
                "Ranking dos serviços mais procurados e rentáveis",
                "Filtros personalizados por período e datas",
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-white/80 p-3 shadow-2xs dark:border-emerald-500/20 dark:bg-slate-900/80"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                    <Check className="size-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-50">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/plans">
                <Button className="gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/25">
                  <Sparkles className="size-4" />
                  <span>Fazer upgrade para o Plano Profissional</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { timeZone: true },
  })

  const params = await searchParams
  const defaults = getDefaultDateRange(user?.timeZone ?? null)
  const startDate = firstSearchParam(params.startDate) ?? defaults.startDate
  const endDate = firstSearchParam(params.endDate) ?? defaults.endDate
  const validRange =
    isValidDate(startDate) && isValidDate(endDate) && startDate <= endDate

  const data = validRange
    ? await getReportsData({
        userId: session.user.id,
        startDate,
        endDate,
      })
    : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl dark:text-emerald-50">
          Relatórios & Métricas
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Acompanhe o volume de atendimentos e a performance financeira estimada.
        </p>
      </div>

      <ReportsDateFilter startDate={startDate} endDate={endDate} />

      {!validRange ? (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertCircle className="size-4 shrink-0" />
          <span>
            Informe um período válido. A data inicial deve ser anterior ou igual à data final.
          </span>
        </div>
      ) : (
        data && (
          <>
            <ReportsSummary data={data} />

            <div className="flex items-center gap-2 rounded-xl bg-slate-100/70 px-4 py-2.5 text-xs text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0 dark:text-emerald-400" />
              <span>
                <strong>Aviso:</strong> O faturamento e o ticket médio são estimativas calculadas a partir dos valores tabelados dos serviços agendados na plataforma.
              </span>
            </div>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <AppointmentsByDay days={data.appointmentsByDay} />
              <AverageTicketByDay days={data.appointmentsByDay} />
              <TopServices services={data.services} />
            </section>
          </>
        )
      )}
    </div>
  )
}
