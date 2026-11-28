import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  DEFAULT_WORKING_DAYS,
  WEEKDAY_OPTIONS,
  computeBlockedSlots,
  formatDurationLabel,
  getNextOpenDate,
  getWeekdayFromDateInput,
  getWeekdayLabel,
  isClinicOpenOnDate,
  isSlotSequenceAvailable,
  parseUtcDateRange,
} from "../schedule-utils.ts"

describe("WEEKDAY_OPTIONS e DEFAULT_WORKING_DAYS", () => {
  it("lista os 7 dias da semana na ordem Seg..Dom sem duplicatas", () => {
    assert.equal(WEEKDAY_OPTIONS.length, 7)
    assert.deepEqual(
      WEEKDAY_OPTIONS.map((d) => d.short),
      ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    )
    assert.deepEqual(
      WEEKDAY_OPTIONS.map((d) => d.value),
      [1, 2, 3, 4, 5, 6, 0]
    )
    assert.deepEqual([...DEFAULT_WORKING_DAYS], [1, 2, 3, 4, 5])
  })
})

describe("getWeekdayFromDateInput e isClinicOpenOnDate", () => {
  it("identifica corretamente dias úteis e fim de semana a partir de ISO YYYY-MM-DD", () => {
    assert.equal(getWeekdayFromDateInput("2026-11-23"), 1) // Segunda
    assert.equal(getWeekdayFromDateInput("2026-11-27"), 5) // Sexta
    assert.equal(getWeekdayFromDateInput("2026-11-28"), 6) // Sábado
    assert.equal(getWeekdayFromDateInput("2026-11-29"), 0) // Domingo
  })

  it("rejeita datas inválidas ou fora do calendário sem fazer rollover", () => {
    assert.equal(getWeekdayFromDateInput(""), null)
    assert.equal(getWeekdayFromDateInput("2026-13-01"), null)
    assert.equal(getWeekdayFromDateInput("2026-02-30"), null)
    assert.equal(parseUtcDateRange("2026-02-30"), null)
    assert.equal(parseUtcDateRange("2026-13-01"), null)
  })

  it("permite agendamento apenas nos dias selecionados (Seg-Sex aberto, Sáb-Dom fechado)", () => {
    const monToFri = [1, 2, 3, 4, 5]
    assert.equal(isClinicOpenOnDate("2026-11-23", monToFri), true)
    assert.equal(isClinicOpenOnDate("2026-11-27", monToFri), true)
    assert.equal(isClinicOpenOnDate("2026-11-28", monToFri), false)
    assert.equal(isClinicOpenOnDate("2026-11-29", monToFri), false)
  })

  it("suporta clínica que abre apenas no fim de semana ou nenhum dia", () => {
    assert.equal(isClinicOpenOnDate("2026-11-28", [6, 0]), true)
    assert.equal(isClinicOpenOnDate("2026-11-27", [6, 0]), false)
    assert.equal(isClinicOpenOnDate("2026-11-27", []), false)
    assert.equal(isClinicOpenOnDate("2026-11-27", null), false)
  })

  it("retorna rótulos em português para os dias da semana", () => {
    assert.equal(getWeekdayLabel("2026-11-28"), "Sábado")
    assert.equal(getWeekdayLabel("2026-11-29"), "Domingo")
    assert.equal(getWeekdayLabel("2026-11-23"), "Segunda-feira")
  })
})

describe("getNextOpenDate", () => {
  it("avança de sábado para segunda-feira quando a clínica abre de Seg a Sex", () => {
    const saturday = new Date(2026, 10, 28, 12, 0, 0) // 28/11/2026 (sábado)
    const nextOpen = getNextOpenDate(saturday, [1, 2, 3, 4, 5])
    assert.equal(getWeekdayFromDateInput(nextOpen), 1)
    assert.equal(nextOpen.getDate(), 30)
  })

  it("mantém a própria data quando o dia já é aberto", () => {
    const friday = new Date(2026, 10, 27, 12, 0, 0) // 27/11/2026 (sexta)
    const nextOpen = getNextOpenDate(friday, [1, 2, 3, 4, 5])
    assert.equal(nextOpen.getDate(), 27)
  })
})

describe("computeBlockedSlots e isSlotSequenceAvailable", () => {
  const clinicTimes = ["08:00", "08:30", "09:00", "09:30", "10:00"]

  it("bloqueia múltiplos slots consecutivos conforme duração do procedimento", () => {
    const blocked = computeBlockedSlots(
      [{ time: "08:30", service: { duration: 60 } }],
      clinicTimes
    )
    assert.deepEqual(blocked, ["08:30", "09:00"])

    assert.equal(isSlotSequenceAvailable("08:00", 2, clinicTimes, blocked), false)
    assert.equal(isSlotSequenceAvailable("08:00", 1, clinicTimes, blocked), true)
    assert.equal(isSlotSequenceAvailable("09:30", 2, clinicTimes, blocked), true)
    assert.equal(isSlotSequenceAvailable("10:00", 2, clinicTimes, blocked), false)
  })

  it("formata rótulos de duração corretamente", () => {
    assert.equal(formatDurationLabel(30), "30 min")
    assert.equal(formatDurationLabel(60), "1h")
    assert.equal(formatDurationLabel(90), "1h 30min")
  })
})
