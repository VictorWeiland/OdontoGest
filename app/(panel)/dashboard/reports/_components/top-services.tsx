import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReportsData } from "../_data-access/get-reports-data"

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
})

interface TopServicesProps {
    services: ReportsData["services"]
}

export function TopServices({ services }: TopServicesProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Serviços mais agendados</CardTitle>
                <CardDescription>Ordenados pela quantidade de agendamentos no período.</CardDescription>
            </CardHeader>
            <CardContent>
                {services.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Nenhum serviço agendado neste período.
                    </p>
                ) : (
                    <ol className="divide-y">
                        {services.map((service, index) => (
                            <li
                                key={service.id}
                                className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-start gap-3">
                                    <span
                                        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
                                        aria-label={`Posição ${index + 1}`}
                                    >
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="font-medium">{service.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {service.appointmentCount}{" "}
                                            {service.appointmentCount === 1 ? "agendamento" : "agendamentos"}
                                            {" · "}
                                            {service.durationMinutes} min no total
                                        </p>
                                    </div>
                                </div>
                                <p className="font-medium sm:text-right">
                                    {currencyFormatter.format(service.estimatedRevenueCents / 100)}
                                </p>
                            </li>
                        ))}
                    </ol>
                )}
            </CardContent>
        </Card>
    )
}
