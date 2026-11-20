/**
 * Utilitários compartilhados de data, duração e cálculo de horários disponíveis.
 * Garante compatibilidade estrita com o fuso America/Sao_Paulo.
 */

export function getSaoPauloToday(): Date {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date())
      .map(({ type, value }) => [type, value])
  )
  return new Date(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    12,
    0,
    0
  )
}

export function formatToSaoPauloIso(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

export function parseIsoDateToNoonDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number)
  return new Date(year, month - 1, day, 12, 0, 0)
}

export function isSameDayInSaoPaulo(dateA: Date, dateB: Date): boolean {
  return formatToSaoPauloIso(dateA) === formatToSaoPauloIso(dateB)
}

export function isSlotInThePast(
  slotTime: string,
  targetDate: Date | string
): boolean {
  const todayStr = formatToSaoPauloIso(getSaoPauloToday())
  const targetStr =
    typeof targetDate === "string"
      ? targetDate
      : formatToSaoPauloIso(targetDate)

  if (targetStr > todayStr) return false
  if (targetStr < todayStr) return true

  const nowParts = Object.fromEntries(
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map(({ type, value }) => [type, value])
  )

  const currentHour = Number(nowParts.hour || 0)
  const currentMinute = Number(nowParts.minute || 0)

  const [slotHour, slotMinute] = slotTime.split(":").map(Number)

  if (slotHour < currentHour) return true
  if (slotHour === currentHour && slotMinute <= currentMinute) return true

  return false
}

export function isSlotSequenceAvailable(
  startSlot: string,
  requiredSlots: number,
  allSlots: string[],
  blockedSlots: string[]
): boolean {
  const startIndex = allSlots.indexOf(startSlot)
  if (startIndex === -1 || startIndex + requiredSlots > allSlots.length) {
    return false
  }

  for (let i = startIndex; i < startIndex + requiredSlots; i++) {
    const slotTime = allSlots[i]
    if (blockedSlots.includes(slotTime)) {
      return false
    }
  }
  return true
}

export function computeBlockedSlots(
  appointments: Array<{ time: string; service: { duration: number } }>,
  clinicTimes: string[]
): string[] {
  const blockedSlots = new Set<string>()

  for (const apt of appointments) {
    const requiredSlots = Math.ceil(apt.service.duration / 30)
    const startIndex = clinicTimes.indexOf(apt.time)

    if (startIndex !== -1) {
      for (let i = 0; i < requiredSlots; i++) {
        const blockedSlot = clinicTimes[startIndex + i]
        if (blockedSlot) {
          blockedSlots.add(blockedSlot)
        }
      }
    }
  }

  return Array.from(blockedSlots)
}

export function parseUtcDateRange(dateStr: string): {
  startDate: Date
  endDate: Date
  appointmentDate: Date
} | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return null
  }
  const [year, month, day] = dateStr.split("-").map(Number)
  if (!year || !month || !day) return null

  const appointmentDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  if (Number.isNaN(appointmentDate.getTime())) return null

  return {
    appointmentDate,
    startDate: appointmentDate,
    endDate: new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)),
  }
}

export function formatDurationLabel(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60)
  const mins = durationMinutes % 60
  if (hours > 0) {
    return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`
  }
  return `${mins} min`
}
