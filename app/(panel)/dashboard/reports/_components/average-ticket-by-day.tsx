import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReportsData } from "../_data-access/get-reports-data"

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
})

function formatDay(date: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00.000Z`))
}

interface AverageTicketByDayProps {
    days: ReportsData["appointmentsByDay"]
}

export function AverageTicketByDay({ days }: AverageTicketByDayProps) {
    const maxTicket = Math.max(...days.map((day) => day.averageTicketCents), 1)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ticket médio por dia</CardTitle>
                <CardDescription>
                    Valor médio estimado dos serviços agendados em cada dia.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {days.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Não há dados de ticket médio neste período.
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {days.map((day) => (
                            <li key={day.date} className="space-y-1">
                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="font-medium">{formatDay(day.date)}</span>
                                    <span>
                                        {currencyFormatter.format(day.averageTicketCents / 100)}
                                        {" · "}
                                        {day.count} {day.count === 1 ? "agendamento" : "agendamentos"}
                                    </span>
                                </div>
                                <div
                                    className="h-2 overflow-hidden rounded-full bg-muted"
                                    role="img"
                                    aria-label={`Ticket médio de ${currencyFormatter.format(day.averageTicketCents / 100)} em ${formatDay(day.date)}`}
                                >
                                    <div
                                        className="h-full rounded-full bg-sky-500"
                                        style={{ width: `${(day.averageTicketCents / maxTicket) * 100}%` }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}
