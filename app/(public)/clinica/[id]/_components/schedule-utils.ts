/**
 * Reexporta os utilitários compartilhados de data e agendamento para manter
 * a compatibilidade da página pública da clínica.
 */
export {
  getSaoPauloToday,
  formatToSaoPauloIso,
  isSameDayInSaoPaulo,
  isSlotInThePast,
  isSlotSequenceAvailable,
  isClinicOpenOnDate,
  getNextOpenDate,
  getWeekdayLabel,
} from "@/lib/schedule-utils"
