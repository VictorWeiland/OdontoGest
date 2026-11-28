import { z } from "zod"
import { extractPhoneNumber } from "@/utils/formatPhone"

export const quickAppointmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome do paciente (mínimo 2 caracteres)")
    .max(120, "Nome muito longo"),
  phone: z
    .string()
    .trim()
    .refine((val) => extractPhoneNumber(val).length >= 10, {
      message: "Informe um telefone válido com DDD",
    }),
  email: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || z.string().email().safeParse(val).success,
      { message: "Informe um endereço de e-mail válido" }
    ),
  serviceId: z.string().min(1, "Selecione um serviço"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecione uma data válida"),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Selecione um horário livre"),
})

export type QuickAppointmentFormData = z.infer<typeof quickAppointmentSchema>

export interface QuickAppointmentService {
  id: string
  name: string
  price: number
  duration: number
}

export interface QuickAppointmentPatient {
  name: string
  phone: string
  email: string
}

export interface QuickAppointmentContextData {
  clinicId: string
  clinicName: string
  clinicStatus: boolean
  times: string[]
  workingDays: number[]
  services: QuickAppointmentService[]
  patients: QuickAppointmentPatient[]
}

export interface QuickAppointmentSuccessData {
  id: string
  clinicName: string
  patientName: string
  patientPhone: string
  patientEmail: string
  serviceName: string
  serviceDuration: number
  servicePrice: number
  dateIso: string
  time: string
}
