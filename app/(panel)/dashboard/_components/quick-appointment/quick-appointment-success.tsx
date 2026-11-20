"use client"

import { Calendar, CheckCircle2, Clock, MessageCircle, Plus, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/utils/formatCurrency"
import { formatDurationLabel } from "@/lib/schedule-utils"
import {
  buildConfirmationWhatsAppUrl,
  formatAppointmentFullDate,
} from "@/utils/whatsapp"
import type { QuickAppointmentSuccessData } from "../../_schemas/quick-appointment"

interface QuickAppointmentSuccessProps {
  appointment: QuickAppointmentSuccessData
  onNewAppointment: () => void
  onClose: () => void
}

export function QuickAppointmentSuccess({
  appointment,
  onNewAppointment,
  onClose,
}: QuickAppointmentSuccessProps) {
  const formattedDate = formatAppointmentFullDate(appointment.dateIso)
  const whatsappUrl = buildConfirmationWhatsAppUrl({
    patientName: appointment.patientName,
    patientPhone: appointment.patientPhone,
    serviceName: appointment.serviceName,
    date: appointment.dateIso,
    time: appointment.time,
    clinicName: appointment.clinicName,
  })

  return (
    <div className="space-y-5 py-2 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="size-8" aria-hidden />
      </div>

      <div>
        <h3 className="text-xl font-extrabold text-emerald-950">
          Agendamento confirmado!
        </h3>
        <p className="mt-1 text-xs text-slate-600">
          O horário já foi adicionado à agenda da clínica.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-left text-xs">
        <div className="flex items-center gap-2 border-b border-emerald-100 pb-2.5">
          <User className="size-4 shrink-0 text-emerald-600" aria-hidden />
          <div className="min-w-0">
            <p className="truncate font-bold text-emerald-950 text-sm">
              {appointment.patientName}
            </p>
            <p className="truncate text-slate-600">{appointment.patientPhone}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <span className="flex items-center gap-1 text-slate-500">
              <Calendar className="size-3.5 text-emerald-600" aria-hidden />
              Data
            </span>
            <p className="mt-0.5 font-semibold text-emerald-950">
              {formattedDate}
            </p>
          </div>
          <div>
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="size-3.5 text-emerald-600" aria-hidden />
              Horário e duração
            </span>
            <p className="mt-0.5 font-semibold text-emerald-950">
              {appointment.time} ({formatDurationLabel(appointment.serviceDuration)})
            </p>
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2 border-t border-emerald-100 pt-2.5">
          <span className="truncate font-bold text-emerald-950 text-sm">
            {appointment.serviceName}
          </span>
          <span className="shrink-0 font-extrabold text-emerald-700 text-sm">
            {formatCurrency(appointment.servicePrice / 100)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 pt-1">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-white shadow-xs shadow-emerald-500/25 transition-colors hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-emerald-600"
        >
          <MessageCircle className="size-4" aria-hidden />
          Confirmar no WhatsApp
        </a>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onNewAppointment}
            className="h-10 flex-1 gap-1.5 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <Plus className="size-4" aria-hidden />
            Novo agendamento
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-10 flex-1 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
