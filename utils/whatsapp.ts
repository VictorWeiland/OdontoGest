/**
 * Utilitários compartilhados de formatação de data de agendamento e links WhatsApp.
 */

export function normalizeBrazilianPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, "")
  if (!cleanPhone) return ""
  return cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`
}

export function formatAppointmentFullDate(dateInput: Date | string): string {
  let targetDate: Date

  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split("-").map(Number)
    targetDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  } else {
    targetDate = new Date(dateInput)
  }

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    dateStyle: "full",
  })
    .format(targetDate)
    .toLowerCase()
}

export function buildConfirmationWhatsAppUrl({
  patientName,
  patientPhone,
  serviceName,
  date,
  time,
  clinicName,
}: {
  patientName: string
  patientPhone: string
  serviceName: string
  date: Date | string
  time: string
  clinicName?: string | null
}): string {
  const fullPhone = normalizeBrazilianPhone(patientPhone)
  const formattedDate = formatAppointmentFullDate(date)
  const clinicLabel = clinicName || "OdontoGEST"

  const message = encodeURIComponent(
    `Olá, ${patientName}! Confirmando sua consulta de ${serviceName} em ${formattedDate} às ${time} na ${clinicLabel}. Pode confirmar?`
  )

  return `https://wa.me/${fullPhone}?text=${message}`
}

export function buildPriorityTriageWhatsAppUrl({
  clinicPhone,
  clinicName,
  patientName,
  reason,
  painLevel,
  painLabel,
}: {
  clinicPhone: string
  clinicName?: string | null
  patientName: string
  reason: string
  painLevel: number
  painLabel: string
}): string {
  const fullPhone = normalizeBrazilianPhone(clinicPhone)
  const clinicLabel = clinicName || "OdontoGEST"
  const cleanName = patientName.trim()
  const greetingName = cleanName ? `Meu nome é ${cleanName}. ` : ""

  const lines = [
    `Olá, ${clinicLabel}! ${greetingName}Preciso de orientação para atendimento odontológico prioritário.`,
    `• *Urgência:* ${reason}`,
    `• *Intensidade da dor:* ${painLevel}/10 • ${painLabel}`,
  ]

  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(lines.join("\n"))}`
}
