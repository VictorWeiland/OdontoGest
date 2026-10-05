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

interface AppointmentsByDayProps {
    days: ReportsData["appointmentsByDay"]
}

export function AppointmentsByDay({ days }: AppointmentsByDayProps) {
    const maxCount = Math.max(...days.map((day) => day.count), 1)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Agendamentos por dia</CardTitle>
                <CardDescription>Volume diário e valor estimado dos serviços agendados.</CardDescription>
            </CardHeader>
            <CardContent>
                {days.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Nenhum agendamento encontrado neste período.
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {days.map((day) => (
                            <li key={day.date} className="space-y-1">
                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="font-medium">{formatDay(day.date)}</span>
                                    <span>
                                        {day.count} {day.count === 1 ? "agendamento" : "agendamentos"}
                                        {" · "}
                                        {currencyFormatter.format(day.estimatedRevenueCents / 100)}
                                    </span>
                                </div>
                                <div
                                    className="h-2 overflow-hidden rounded-full bg-muted"
                                    role="img"
                                    aria-label={`${day.count} agendamentos em ${formatDay(day.date)}`}
                                >
                                    <div
                                        className="h-full rounded-full bg-emerald-500"
                                        style={{ width: `${(day.count / maxCount) * 100}%` }}
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
