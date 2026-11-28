import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { quickAppointmentSchema } from "../../app/(panel)/dashboard/_schemas/quick-appointment.ts"
import {
  buildConfirmationWhatsAppUrl,
  buildPriorityTriageWhatsAppUrl,
  formatAppointmentFullDate,
  normalizeBrazilianPhone,
} from "../../utils/whatsapp.ts"

describe("quickAppointmentSchema", () => {
  it("aceita agendamento rápido válido com e-mail opcional vazio", () => {
    const parsed = quickAppointmentSchema.safeParse({
      name: "Maria Silva",
      phone: "(11) 99999-8888",
      email: "",
      serviceId: "srv-123",
      date: "2026-11-30",
      time: "09:30",
    })
    assert.equal(parsed.success, true)
  })

  it("rejeita nome curto, telefone incompleto, data ou horário inválidos", () => {
    assert.equal(
      quickAppointmentSchema.safeParse({
        name: "A",
        phone: "11999",
        email: "invalido",
        serviceId: "",
        date: "30/11/2026",
        time: "9h",
      }).success,
      false
    )
  })
})

describe("Utilitários de WhatsApp e formatação de data", () => {
  it("normaliza telefone brasileiro adicionando DDI 55 quando necessário", () => {
    assert.equal(normalizeBrazilianPhone("(11) 99999-8888"), "5511999998888")
    assert.equal(normalizeBrazilianPhone("5511999998888"), "5511999998888")
    assert.equal(normalizeBrazilianPhone(""), "")
  })

  it("formata data ISO sem deslocamento de fuso", () => {
    const formatted = formatAppointmentFullDate("2026-11-30")
    assert.match(formatted, /30 de novembro de 2026/)
  })

  it("monta URL de confirmação no WhatsApp com dados da consulta", () => {
    const url = buildConfirmationWhatsAppUrl({
      patientName: "João",
      patientPhone: "(11) 98888-7777",
      serviceName: "Limpeza",
      date: "2026-11-30",
      time: "14:00",
      clinicName: "Clínica Sorriso",
    })
    assert.ok(url.startsWith("https://wa.me/5511988887777?text="))
    assert.ok(decodeURIComponent(url).includes("Limpeza"))
    assert.ok(decodeURIComponent(url).includes("14:00"))
  })

  it("monta URL de triagem prioritária com motivo e intensidade da dor", () => {
    const url = buildPriorityTriageWhatsAppUrl({
      clinicPhone: "(11) 97777-6666",
      clinicName: "Clínica Sorriso",
      patientName: "Ana",
      reason: "Dor de dente aguda",
      painLevel: 8,
      painLabel: "Intensa",
    })
    assert.ok(url.startsWith("https://wa.me/5511977776666?text="))
    assert.ok(decodeURIComponent(url).includes("8/10"))
  })
})
