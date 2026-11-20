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
} from "@/lib/schedule-utils"
