/**
 * Utilitários compartilhados de formatação de data de agendamento e link WhatsApp.
 */

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
  const cleanPhone = patientPhone.replace(/\D/g, "")
  const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`
  const formattedDate = formatAppointmentFullDate(date)
  const clinicLabel = clinicName || "OdontoGEST"

  const message = encodeURIComponent(
    `Olá, ${patientName}! Confirmando sua consulta de ${serviceName} em ${formattedDate} às ${time} na ${clinicLabel}. Pode confirmar?`
  )

  return `https://wa.me/${fullPhone}?text=${message}`
}
