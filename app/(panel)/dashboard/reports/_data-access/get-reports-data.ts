import prisma from "@/lib/prisma"

export interface ReportsDateRange {
    startDate: string
    endDate: string
}

export interface ReportsData {
    appointmentCount: number
    estimatedRevenueCents: number
    averageTicketCents: number
    appointmentsByDay: {
        date: string
        count: number
        estimatedRevenueCents: number
        averageTicketCents: number
    }[]
    services: {
        id: string
        name: string
        appointmentCount: number
        estimatedRevenueCents: number
        durationMinutes: number
    }[]
}

export async function getReportsData({
    userId,
    startDate,
    endDate,
}: ReportsDateRange & { userId: string }): Promise<ReportsData> {
    const [year, month, day] = endDate.split("-").map(Number)
    const endExclusive = new Date(Date.UTC(year, month - 1, day + 1))

    const appointments = await prisma.appointment.findMany({
        where: {
            userId,
            appointmentDate: {
                gte: new Date(`${startDate}T00:00:00.000Z`),
                lt: endExclusive,
            },
        },
        select: {
            appointmentDate: true,
            service: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    duration: true,
                },
            },
        },
        orderBy: {
            appointmentDate: "asc",
        },
    })

    const dailyTotals = new Map<string, { count: number; revenue: number }>()
    const serviceTotals = new Map<string, {
        id: string
        name: string
        appointmentCount: number
        estimatedRevenueCents: number
        durationMinutes: number
    }>()
    let estimatedRevenueCents = 0

    for (const appointment of appointments) {
        const date = appointment.appointmentDate.toISOString().slice(0, 10)
        const { service } = appointment
        const dayTotal = dailyTotals.get(date) ?? { count: 0, revenue: 0 }
        dayTotal.count += 1
        dayTotal.revenue += service.price
        dailyTotals.set(date, dayTotal)

        const serviceTotal = serviceTotals.get(service.id) ?? {
            id: service.id,
            name: service.name,
            appointmentCount: 0,
            estimatedRevenueCents: 0,
            durationMinutes: 0,
        }
        serviceTotal.appointmentCount += 1
        serviceTotal.estimatedRevenueCents += service.price
        serviceTotal.durationMinutes += service.duration
        serviceTotals.set(service.id, serviceTotal)

        estimatedRevenueCents += service.price
    }

    return {
        appointmentCount: appointments.length,
        estimatedRevenueCents,
        averageTicketCents: appointments.length
            ? Math.round(estimatedRevenueCents / appointments.length)
            : 0,
        appointmentsByDay: Array.from(dailyTotals, ([date, totals]) => ({
            date,
            count: totals.count,
            estimatedRevenueCents: totals.revenue,
            averageTicketCents: Math.round(totals.revenue / totals.count),
        })).sort((left, right) => left.date.localeCompare(right.date)),
        services: Array.from(serviceTotals.values()).sort(
            (left, right) => right.appointmentCount - left.appointmentCount
                || right.estimatedRevenueCents - left.estimatedRevenueCents
        ),
    }
}
