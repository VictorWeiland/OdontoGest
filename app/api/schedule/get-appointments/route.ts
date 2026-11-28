// Backend meusite.com/api/schedule/get-appointments

import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { computeBlockedSlots, isClinicOpenOnDate, parseUtcDateRange } from '@/lib/schedule-utils'

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl

    const userId = searchParams.get('userId')
    const dateParam = searchParams.get('date')

    if (!userId || userId === 'null' || !dateParam || dateParam === 'null') {
        return NextResponse.json({
            error: "Nenhum agendamento encontrado"
        }, {
            status: 400
        })
    }

    const range = parseUtcDateRange(dateParam)
    if (!range) {
        return NextResponse.json({
            error: "Nenhum agendamento encontrado"
        }, {
            status: 400
        })
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        })
        if (!user) {
            return NextResponse.json({
                error: "Nenhum agendamento encontrado"
            }, {
                status: 400
            })
        }

        if (!user.status || !isClinicOpenOnDate(dateParam, user.workingDays)) {
            return NextResponse.json(user.times)
        }

        const appointments = await prisma.appointment.findMany({
            where: {
                userId: userId,
                appointmentDate: {
                    gte: range.startDate,
                    lte: range.endDate
                }
            },
            include: {
                service: true,
            }
        })

        const blockedTimes = computeBlockedSlots(appointments, user.times)

        return NextResponse.json(blockedTimes)

    } catch (err) {
        console.error(err);
        return NextResponse.json({
            error: "Nenhum agendamento encontrado"
        }, {
            status: 400
        })
    }
}
