"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { checkSubscription } from "@/utils/permissions/checkSubscription"
import { extractPhoneNumber, formatPhone } from "@/utils/formatPhone"
import {
  formatToSaoPauloIso,
  getSaoPauloToday,
  isSlotInThePast,
  parseUtcDateRange,
} from "@/lib/schedule-utils"
import { bookAppointmentInTransaction } from "@/lib/appointments/book-appointment"
import {
  quickAppointmentSchema,
  type QuickAppointmentContextData,
  type QuickAppointmentFormData,
  type QuickAppointmentPatient,
  type QuickAppointmentSuccessData,
} from "../_schemas/quick-appointment"

export async function getQuickAppointmentContext(): Promise<{
  data?: QuickAppointmentContextData
  error?: string
}> {
  const session = await auth()
  const clinicId = session?.user?.id

  if (!clinicId) {
    return { error: "Acesso não autorizado." }
  }

  try {
    const [clinic, services, rawAppointments] = await Promise.all([
      prisma.user.findUnique({
        where: { id: clinicId },
        select: {
          id: true,
          name: true,
          times: true,
        },
      }),
      prisma.service.findMany({
        where: {
          userId: clinicId,
          status: true,
        },
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.appointment.findMany({
        where: {
          userId: clinicId,
        },
        select: {
          name: true,
          phone: true,
          email: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 500,
      }),
    ])

    if (!clinic) {
      return { error: "Clínica não encontrada." }
    }

    const seen = new Set<string>()
    const patients: QuickAppointmentPatient[] = []

    for (const item of rawAppointments) {
      const cleanName = item.name.trim()
      const phoneDigits = extractPhoneNumber(item.phone || "")
      const key = `${cleanName.toLowerCase()}|${phoneDigits}|${(item.email || "").trim().toLowerCase()}`
      if (!cleanName || seen.has(key)) continue
      seen.add(key)
      patients.push({
        name: cleanName,
        phone: formatPhone(item.phone || ""),
        email: (item.email || "").trim(),
      })
      if (patients.length >= 200) break
    }

    return {
      data: {
        clinicId: clinic.id,
        clinicName: clinic.name || "OdontoGEST",
        times: clinic.times,
        services,
        patients,
      },
    }
  } catch {
    return { error: "Falha ao carregar dados para agendamento." }
  }
}

export async function createQuickAppointment(
  input: QuickAppointmentFormData
): Promise<{
  data?: QuickAppointmentSuccessData
  error?: string
  conflict?: boolean
}> {
  const session = await auth()
  const clinicId = session?.user?.id

  if (!clinicId) {
    return { error: "Acesso não autorizado." }
  }

  const parsed = quickAppointmentSchema.safeParse(input)
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Verifique os campos informados.",
    }
  }

  const { name, phone, email, serviceId, date, time } = parsed.data

  const todayIso = formatToSaoPauloIso(getSaoPauloToday())
  if (date < todayIso) {
    return { error: "Não é possível agendar em uma data passada." }
  }

  if (isSlotInThePast(time, date)) {
    return {
      error: "Este horário já passou. Escolha outro horário disponível.",
      conflict: true,
    }
  }

  if (!parseUtcDateRange(date)) {
    return { error: "Data inválida para agendamento." }
  }

  try {
    const subscription = await checkSubscription(clinicId)
    if (subscription.subscriptionStatus === "EXPIRED") {
      return {
        error:
          "Seu período de teste expirou. Assine um plano para criar novos agendamentos.",
      }
    }

    const formattedPhone = formatPhone(phone)
    const cleanName = name.trim()
    const cleanEmail = email.trim()

    const result = await bookAppointmentInTransaction({
      clinicId,
      serviceId,
      dateIso: date,
      time,
      name: cleanName,
      phone: formattedPhone,
      email: cleanEmail,
    })

    if (result.error || !result.data) {
      return {
        error: result.error,
        conflict: result.conflict,
      }
    }

    revalidatePath("/dashboard")

    return {
      data: {
        id: result.data.appointment.id,
        clinicName: result.data.clinicName,
        patientName: cleanName,
        patientPhone: formattedPhone,
        patientEmail: cleanEmail,
        serviceName: result.data.service.name,
        serviceDuration: result.data.service.duration,
        servicePrice: result.data.service.price,
        dateIso: date,
        time,
      },
    }
  } catch {
    return {
      error: "Não foi possível salvar o agendamento. Tente novamente.",
    }
  }
}
