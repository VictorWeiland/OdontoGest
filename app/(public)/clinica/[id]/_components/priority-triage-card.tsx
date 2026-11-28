"use client"

import { useRef, useState } from "react"
import {
  AlertCircle,
  Calendar,
  Droplets,
  HeartPulse,
  MessageCircle,
  MessageSquareMore,
  ShieldAlert,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { buildPriorityTriageWhatsAppUrl } from "@/utils/whatsapp"

interface PriorityTriageCardProps {
  clinicName: string
  clinicPhone: string
  onSwitchToSchedule: () => void
}

const URGENCY_REASONS = [
  {
    id: "dor-aguda",
    label: "Dor de dente aguda",
    icon: Zap,
    iconStyle: "bg-rose-100 text-rose-600",
  },
  {
    id: "dente-quebrado",
    label: "Dente quebrado ou trauma",
    icon: Sparkles,
    iconStyle: "bg-amber-100 text-amber-700",
  },
  {
    id: "inchaco",
    label: "Inchaço ou abscesso",
    icon: ShieldAlert,
    iconStyle: "bg-sky-100 text-sky-700",
  },
  {
    id: "protese-solta",
    label: "Prótese ou coroa solta",
    icon: Wrench,
    iconStyle: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "sangramento",
    label: "Sangramento / Pós-operatório",
    icon: Droplets,
    iconStyle: "bg-pink-100 text-pink-700",
  },
  {
    id: "outro",
    label: "Outro desconforto",
    icon: MessageSquareMore,
    iconStyle: "bg-slate-100 text-slate-700",
  },
] as const

function getPainSeverity(level: number) {
  if (level <= 2) {
    return {
      label: "Leve",
      badgeClass: "bg-emerald-100 text-emerald-800",
    }
  }
  if (level <= 5) {
    return {
      label: "Moderada",
      badgeClass: "bg-yellow-100 text-yellow-800",
    }
  }
  if (level <= 8) {
    return {
      label: "Intensa",
      badgeClass: "bg-amber-100 text-amber-800",
    }
  }
  return {
    label: "Urgência Máxima",
    badgeClass: "bg-rose-100 text-rose-700",
  }
}

export function PriorityTriageCard({
  clinicName,
  clinicPhone,
  onSwitchToSchedule,
}: PriorityTriageCardProps) {
  const [selectedReason, setSelectedReason] = useState<string>(
    URGENCY_REASONS[0].label
  )
  const [painLevel, setPainLevel] = useState<number>(7)
  const [patientName, setPatientName] = useState<string>("")
  const [nameError, setNameError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement | null>(null)

  const severity = getPainSeverity(painLevel)

  const whatsappUrl = buildPriorityTriageWhatsAppUrl({
    clinicPhone,
    clinicName,
    patientName,
    reason: selectedReason,
    painLevel,
    painLabel: severity.label,
  })

  function handleSendClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (patientName.trim().length < 2) {
      e.preventDefault()
      setNameError("Informe seu nome para identificar seu atendimento.")
      nameInputRef.current?.focus()
      return
    }
    setNameError(null)
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Cabeçalho escuro da ficha */}
        <div className="flex flex-col gap-3 bg-emerald-950 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-xs">
              <HeartPulse className="size-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight sm:text-lg">
                Ficha de Prioridade Odontológica
              </h2>
              <p className="text-xs text-emerald-100/85">
                Triagem rápida para contato com{" "}
                <strong className="text-white">{clinicName}</strong>
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
            <span className="size-2 rounded-full bg-emerald-400" aria-hidden />
            Atendimento Prioritário
          </span>
        </div>

        {/* Corpo do formulário */}
        <div className="space-y-5 p-5 sm:p-6">
          {/* 1. Motivo da urgência */}
          <div className="space-y-2.5">
            <p
              id="triage-reason-label"
              className="text-sm font-bold text-emerald-950 dark:text-emerald-50"
            >
              1. Selecione o motivo da sua urgência ou desconforto:
            </p>

            <div
              role="radiogroup"
              aria-labelledby="triage-reason-label"
              className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {URGENCY_REASONS.map((reason) => {
                const Icon = reason.icon
                const isSelected = selectedReason === reason.label

                return (
                  <button
                    key={reason.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedReason(reason.label)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600",
                      isSelected
                        ? "border-2 border-emerald-500 bg-emerald-50/70 shadow-2xs dark:bg-emerald-500/15"
                        : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/10"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        reason.iconStyle
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="text-xs font-bold leading-snug text-emerald-950 dark:text-emerald-50">
                      {reason.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Intensidade da dor */}
          <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label
                htmlFor="triage-pain-slider"
                className="text-sm font-bold text-emerald-950 dark:text-emerald-50"
              >
                2. Intensidade da dor agora (0 a 10):
              </Label>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
                  severity.badgeClass
                )}
              >
                {painLevel}/10 • {severity.label}
              </span>
            </div>

            <input
              id="triage-pain-slider"
              type="range"
              min={0}
              max={10}
              step={1}
              value={painLevel}
              onChange={(e) => setPainLevel(Number(e.target.value))}
              aria-valuetext={`${painLevel} de 10, ${severity.label}`}
              className="pain-slider w-full"
            />

            <div className="flex items-center justify-between gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span>0-2: Leve</span>
              <span>3-5: Moderada</span>
              <span className="font-bold text-amber-700 dark:text-amber-400">6-8: Intensa</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                9-10: Urgência Máxima
              </span>
            </div>
          </div>

          {/* 3. Nome e CTA WhatsApp */}
          <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-12">
            <div className="space-y-1.5 sm:col-span-5">
              <Label
                htmlFor="triage-patient-name"
                className="text-sm font-bold text-emerald-950 dark:text-emerald-50"
              >
                3. Seu Nome:
              </Label>
              <Input
                ref={nameInputRef}
                id="triage-patient-name"
                type="text"
                autoComplete="name"
                placeholder="Digite seu nome"
                value={patientName}
                aria-invalid={Boolean(nameError)}
                onChange={(e) => {
                  setPatientName(e.target.value)
                  if (nameError && e.target.value.trim().length >= 2) {
                    setNameError(null)
                  }
                }}
                className="h-11 rounded-xl border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              {nameError && (
                <p
                  role="alert"
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-400"
                >
                  <AlertCircle className="size-3.5 shrink-0" aria-hidden />
                  {nameError}
                </p>
              )}
            </div>

            <div className="sm:col-span-7 sm:pt-6">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSendClick}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-bold text-white shadow-sm shadow-emerald-500/25 transition-all duration-150 hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                <MessageCircle className="size-4 shrink-0" aria-hidden />
                <span>Enviar Triagem pelo WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Prévia da mensagem automática */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-500/25 dark:bg-emerald-950/30">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              <MessageCircle className="size-3.5" aria-hidden />
              Prévia da mensagem automática para {clinicPhone}:
            </p>
            <div className="mt-2 space-y-1 text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-300">
              <p>
                Olá, {clinicName}!{" "}
                {patientName.trim() ? `Meu nome é ${patientName.trim()}. ` : ""}
                Preciso de orientação para atendimento odontológico prioritário.
              </p>
              <p>
                • <strong>Urgência:</strong> {selectedReason}
              </p>
              <p>
                • <strong>Intensidade da dor:</strong> {painLevel}/10 •{" "}
                {severity.label}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Retorno para agendamento convencional */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          onClick={onSwitchToSchedule}
          className="gap-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-300"
        >
          <Calendar className="size-3.5" aria-hidden />
          <span>Prefere escolher dia e horário? Voltar para o agendamento</span>
        </Button>
      </div>
    </div>
  )
}
