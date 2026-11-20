"use server"

import { z } from "zod"
import { formatToSaoPauloIso } from "@/lib/schedule-utils"
import { bookAppointmentInTransaction } from "@/lib/appointments/book-appointment"

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatorio"),
  email: z.string().email("O email é obrigatorio"),
  phone: z.string().min(1, "O Telefone é obrigatorio"),
  date: z.date(),
  serviceId: z.string().min(1, "O serviço é obrigatorio"),
  time: z.string().min(1, "O horário é obrigatorio"),
  clinicId: z.string().min(1, "O horário é obrigatorio"),
})

type FormSchema = z.infer<typeof formSchema>

export async function createNewAppointment(formData: FormSchema) {
  const schema = formSchema.safeParse(formData)

  if (!schema.success) {
    return {
      error: schema.error.issues[0].message,
    }
  }

  try {
    const dateIso = formatToSaoPauloIso(new Date(formData.date))

    const result = await bookAppointmentInTransaction({
      clinicId: formData.clinicId,
      serviceId: formData.serviceId,
      dateIso,
      time: formData.time,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    })

    if (result.error || !result.data) {
      return {
        error: result.error || "Erro ao cadastrar agendamento",
      }
    }

    return {
      data: result.data.appointment,
    }
  } catch {
    return {
      error: "Erro ao cadastrar agendamento",
    }
  }
}
