"use client"

import {
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { AppointmentWithService } from "./appoitments-list"
import { formatCurrency } from "@/utils/formatCurrency"
import {
  buildConfirmationWhatsAppUrl,
  formatAppointmentFullDate,
} from "@/utils/whatsapp"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  MessageCircle,
  Trash2,
  Stethoscope,
  CheckCircle2,
} from "lucide-react"
import { useState } from "react"
import { cancelAppointment } from "../../_actions/cancel-appointment"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

interface DialogAppointmentsProps {
  appointment: AppointmentWithService | null
  onClose?: () => void
}

function getInitials(name?: string | null) {
  if (!name) return "P"
  const parts = name.trim().split(" ").filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function DialogAppointment({
  appointment,
  onClose,
}: DialogAppointmentsProps) {
  const queryClient = useQueryClient()
  const [cancelling, setCancelling] = useState(false)

  if (!appointment) return null

  // Data em minúsculas: ex.: "sexta-feira, 13 de novembro de 2026"
  const appointmentDateFormatted = formatAppointmentFullDate(
    appointment.appointmentDate
  )

  const clinicName = appointment.user?.name || "OdontoGEST"
  const whatsappUrl = buildConfirmationWhatsAppUrl({
    patientName: appointment.name,
    patientPhone: appointment.phone,
    serviceName: appointment.service.name,
    date: appointment.appointmentDate,
    time: appointment.time,
    clinicName,
  })

  async function handleCancel() {
    if (!appointment) return
    const confirmed = window.confirm(
      `Deseja realmente cancelar o agendamento de ${appointment.name}?`
    )
    if (!confirmed) return

    setCancelling(true)
    try {
      const response = await cancelAppointment({
        appointmentId: appointment.id,
      })
      if (response.error) {
        toast.error(response.error)
        return
      }
      toast.success(response.data)
      queryClient.invalidateQueries({ queryKey: ["get-appointments"] })
      onClose?.()
    } catch {
      toast.error("Erro ao cancelar o agendamento.")
    } finally {
      setCancelling(false)
    }
  }

  const durationHours = Math.floor(appointment.service.duration / 60)
  const durationMins = appointment.service.duration % 60
  const durationText =
    durationHours > 0
      ? `${durationHours}h${durationMins > 0 ? ` ${durationMins}min` : ""}`
      : `${durationMins} min`

  return (
    <DialogContent className="w-full sm:max-w-[520px] max-w-[calc(100vw-2rem)] rounded-2xl p-6 sm:p-7 min-w-0 overflow-x-hidden box-border">
      <DialogHeader className="text-left min-w-0">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <Badge variant="success" className="gap-1 px-3 py-1 text-xs">
            <CheckCircle2 className="size-3.5" />
            Agendado
          </Badge>
          <span className="text-xs text-slate-400">ID: {appointment.id.slice(0, 8)}</span>
        </div>
        <DialogTitle className="mt-3 text-2xl font-extrabold text-emerald-950 truncate">
          Detalhes do Agendamento
        </DialogTitle>
        <DialogDescription className="text-xs text-slate-500">
          Informações completas do paciente e do serviço agendado.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 pt-2 min-w-0">
        {/* Bloco Paciente */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 sm:p-4 min-w-0">
          <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 font-bold text-base sm:text-lg text-white shadow-xs shadow-emerald-500/30">
            {getInitials(appointment.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm sm:text-base font-bold text-emerald-950">
              {appointment.name}
            </h4>
            <div className="mt-1 flex flex-col gap-1 text-xs text-slate-600 sm:flex-row sm:flex-wrap sm:gap-x-4">
              <span className="inline-flex items-center gap-1 truncate">
                <Phone className="size-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{appointment.phone}</span>
              </span>
              {appointment.email && (
                <span className="inline-flex items-center gap-1 truncate">
                  <Mail className="size-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{appointment.email}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bloco Data & Horário */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 min-w-0">
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 min-w-0">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Calendar className="size-3.5 shrink-0 text-emerald-600" />
              Data
            </span>
            <p className="mt-1 text-xs font-bold text-emerald-950 truncate">
              {appointmentDateFormatted}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 min-w-0">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Clock className="size-3.5 shrink-0 text-emerald-600" />
              Horário
            </span>
            <p className="mt-1 text-base font-extrabold text-emerald-950">
              {appointment.time}
            </p>
          </div>
        </div>

        {/* Bloco Serviço & Valor */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Stethoscope className="size-4 shrink-0 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wide truncate">
                Serviço
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500 shrink-0">
              Duração: {durationText}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2 border-t border-emerald-100/60 pt-2 min-w-0">
            <p className="text-sm sm:text-base font-bold text-emerald-950 truncate">
              {appointment.service.name}
            </p>
            <p className="text-base sm:text-lg font-extrabold text-emerald-600 shrink-0">
              {formatCurrency(appointment.service.price / 100)}
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-2.5 pt-2 sm:flex-row min-w-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-xs shadow-emerald-500/25 transition-colors hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-emerald-600 text-center"
          >
            <MessageCircle className="size-4 shrink-0" />
            <span className="truncate">Conversar no WhatsApp</span>
          </a>

          <Button
            type="button"
            variant="destructive"
            disabled={cancelling}
            onClick={handleCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold sm:w-auto shrink-0"
          >
            <Trash2 className="size-4" />
            <span>{cancelling ? "Cancelando..." : "Cancelar agendamento"}</span>
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}
