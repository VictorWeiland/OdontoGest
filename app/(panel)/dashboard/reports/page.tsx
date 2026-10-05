import { redirect } from "next/navigation"
import getSession from "@/lib/getSession"
import { getPermissionUserToReports } from "./_data-access/get-permission-reports"
import { getReportsData } from "./_data-access/get-reports-data"
import { AverageTicketByDay } from "./_components/average-ticket-by-day"
import { AppointmentsByDay } from "./_components/appointments-by-day"
import { ReportsDateFilter } from "./_components/reports-date-filter"
import { ReportsSummary } from "./_components/reports-summary"
import { TopServices } from "./_components/top-services"

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

function getDefaultDateRange() {
    const today = new Date().toISOString().slice(0, 10)
    return {
        startDate: `${today.slice(0, 7)}-01`,
        endDate: today,
    }
}

export default async function Reports({
    searchParams,
}: {
    searchParams: Promise<ReportsSearchParams>
}) {
    const session = await getSession()

    if (!session?.user?.id) {
        redirect("/")
    }

    const hasPermission = await getPermissionUserToReports({ userId: session.user.id })

    if (!hasPermission) {
        return (
            <main className="space-y-2">
                <h1 className="text-2xl font-bold">Relatórios</h1>
                <p>Assine o plano Profissional ativo para acessar os relatórios.</p>
            </main>
        )
    }

    const params = await searchParams
    const defaults = getDefaultDateRange()
    const startDate = firstSearchParam(params.startDate) ?? defaults.startDate
    const endDate = firstSearchParam(params.endDate) ?? defaults.endDate
    const validRange = isValidDate(startDate)
        && isValidDate(endDate)
        && startDate <= endDate
    const data = validRange
        ? await getReportsData({
            userId: session.user.id,
            startDate,
            endDate,
        })
        : null

    return (
        <main className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-2xl font-bold">Relatórios</h1>
                <p className="text-sm text-muted-foreground">
                    Acompanhe os agendamentos e o desempenho dos seus serviços.
                </p>
            </header>

            <ReportsDateFilter startDate={startDate} endDate={endDate} />

            {!validRange ? (
                <p className="text-sm font-medium text-red-600" role="alert">
                    Informe um período válido. A data inicial deve ser anterior ou igual à data final.
                </p>
            ) : data && (
                <>
                    <ReportsSummary data={data} />
                    <p className="text-xs text-muted-foreground">
                        O faturamento e o ticket médio são estimativas com base nos valores dos serviços
                        agendados; não representam pagamentos confirmados.
                    </p>
                    <section className="grid gap-4 xl:grid-cols-2">
                        <AppointmentsByDay days={data.appointmentsByDay} />
                        <AverageTicketByDay days={data.appointmentsByDay} />
                        <TopServices services={data.services} />
                    </section>
                </>
            )}
        </main>
    )
}