"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { getSaoPauloToday } from "./schedule-utils"

export const appointmentSchema = z.object({
  name: z
    .string()
    .min(2, "Por favor, informe seu nome completo"),
  email: z
    .string()
    .email("Informe um endereço de e-mail válido"),
  phone: z
    .string()
    .min(10, "Informe um telefone para contato com DDD"),
  date: z.date({
    errorMap: () => ({ message: "Selecione uma data para o atendimento" }),
  }),
  serviceId: z
    .string()
    .min(1, "Selecione o procedimento odontológico"),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>

export function useAppointmentForm() {
  return useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      serviceId: "",
      date: getSaoPauloToday(),
    },
  })
}
