/**
 * Utilitários de data e agendamento para a página pública da clínica.
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

export function isSameDayInSaoPaulo(dateA: Date, dateB: Date): boolean {
  return formatToSaoPauloIso(dateA) === formatToSaoPauloIso(dateB)
}

export function isSlotInThePast(slotTime: string, targetDate: Date): boolean {
  const todayStr = formatToSaoPauloIso(getSaoPauloToday())
  const targetStr = formatToSaoPauloIso(targetDate)

  // Se a data do agendamento for posterior a hoje, o slot não passou
  if (targetStr > todayStr) return false
  // Se for anterior, já passou
  if (targetStr < todayStr) return true

  // Se for hoje, compara hora e minuto no fuso America/Sao_Paulo
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
