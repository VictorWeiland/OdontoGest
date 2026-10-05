import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReportsData } from "../_data-access/get-reports-data"

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
            label: "Agendamentos no período",
            value: data.appointmentCount.toLocaleString("pt-BR"),
        },
        {
            label: "Faturamento estimado",
            value: currencyFormatter.format(data.estimatedRevenueCents / 100),
        },
        {
            label: "Ticket médio estimado",
            value: currencyFormatter.format(data.averageTicketCents / 100),
        },
    ]

    return (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Resumo do período">
            {metrics.map((metric) => (
                <Card key={metric.label}>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {metric.label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{metric.value}</p>
                    </CardContent>
                </Card>
            ))}
        </section>
    )
}
