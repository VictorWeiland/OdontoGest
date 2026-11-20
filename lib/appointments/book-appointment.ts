import prisma from "@/lib/prisma"
import {
  computeBlockedSlots,
  isSlotSequenceAvailable,
  parseUtcDateRange,
} from "@/lib/schedule-utils"

export interface BookAppointmentInput {
  clinicId: string
  serviceId: string
  dateIso: string
  time: string
  name: string
  phone: string
  email: string
}

export interface BookAppointmentResultData {
  appointment: {
    id: string
    name: string
    email: string
    phone: string
    appointmentDate: Date
    time: string
    serviceId: string
    userId: string
    createdAt: Date
    updatedAt: Date
  }
  clinicName: string
  service: {
    id: string
    name: string
    duration: number
    price: number
  }
}

export async function bookAppointmentInTransaction(
  input: BookAppointmentInput
): Promise<{
  data?: BookAppointmentResultData
  error?: string
  conflict?: boolean
}> {
  const { clinicId, serviceId, dateIso, time, name, phone, email } = input

  const range = parseUtcDateRange(dateIso)
  if (!range) {
    return { error: "Data inválida para agendamento." }
  }

  return prisma.$transaction(async (tx) => {
    // Lock transacional compartilhado por clínica+data entre painel e página pública
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${clinicId}:${dateIso}`}))`

    const [clinic, service] = await Promise.all([
      tx.user.findUnique({
        where: { id: clinicId },
        select: { id: true, name: true, times: true },
      }),
      tx.service.findFirst({
        where: {
          id: serviceId,
          userId: clinicId,
          status: true,
        },
        select: {
          id: true,
          name: true,
          duration: true,
          price: true,
        },
      }),
    ])

    if (!clinic) {
      return { error: "Clínica não encontrada." }
    }

    if (!service) {
      return { error: "Serviço não encontrado ou inativo." }
    }

    const requiredSlots = Math.ceil(service.duration / 30)

    const existingAppointments = await tx.appointment.findMany({
      where: {
        userId: clinicId,
        appointmentDate: {
          gte: range.startDate,
          lte: range.endDate,
        },
      },
      select: {
        time: true,
        service: {
          select: {
            duration: true,
          },
        },
      },
    })

    const blockedSlots = computeBlockedSlots(existingAppointments, clinic.times)
    const isAvailable = isSlotSequenceAvailable(
      time,
      requiredSlots,
      clinic.times,
      blockedSlots
    )

    if (!isAvailable) {
      return {
        error: "Este horário acabou de ser ocupado",
        conflict: true,
      }
    }

    const appointment = await tx.appointment.create({
      data: {
        name,
        email,
        phone,
        time,
        appointmentDate: range.appointmentDate,
        serviceId: service.id,
        userId: clinicId,
      },
    })

    return {
      data: {
        appointment,
        clinicName: clinic.name || "OdontoGEST",
        service,
      },
    }
  })
}
