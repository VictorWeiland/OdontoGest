"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { formatToSaoPauloIso, getSaoPauloToday } from "@/lib/schedule-utils"
import { Prisma } from "@/lib/generated/prisma/client"
import { Button } from "@/components/ui/button"
import {
  Eye,
  Trash2,
  MessageCircle,
  Plus,
  Clock,
} from "lucide-react"
import { cancelAppointment } from "../../_actions/cancel-appointment"
import { toast } from "sonner"
import { Dialog } from "@/components/ui/dialog"
import { DialogAppointment } from "./dialog-appointments"
import { ButtonPickerAppointment } from "./button-date"
import { AppointmentsSummary } from "./appointments-summary"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { formatCurrency } from "@/utils/formatCurrency"
import Link from "next/link"
import { useQuickAppointment } from "../quick-appointment/quick-appointment-modal"

export type AppointmentWithService = Prisma.AppointmentGetPayload<{
  include: {
    service: true
    user: {
      select: {
        name: true
      }
    }
  }
}>

interface AppointmentsListProps {
  times: string[]
  userId?: string
}

function getInitials(name?: string | null) {
  if (!name) return "P"
  const parts = name.trim().split(" ").filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(":").map(Number)
  const totalMinutes = h * 60 + m + durationMinutes
  const endH = Math.floor(totalMinutes / 60) % 24
  const endM = totalMinutes % 60
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`
}

export function AppointmentsList({ times, userId }: AppointmentsListProps) {
  const searchParams = useSearchParams()
  const dateParam = searchParams.get("date")
  const queryClient = useQueryClient()
  const { openQuickAppointment } = useQuickAppointment()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [detailAppointment, setDetailAppointment] =
    useState<AppointmentWithService | null>(null)

  const activeDate = useMemo(() => {
    return dateParam || formatToSaoPauloIso(getSaoPauloToday())
  }, [dateParam])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["get-appointments", activeDate],
    queryFn: async () => {
      const response = await fetch(
        `/api/clinic/appointments?date=${activeDate}`
      )
      if (!response.ok) {
        throw new Error(`Falha ao carregar agendamentos (${response.status})`)
      }
      return (await response.json()) as AppointmentWithService[]
    },
    staleTime: 20000,
    refetchInterval: 60000,
  })

  // Mapeia os slots: início do agendamento e continuações
  const { startMap, continuationSet } = useMemo(() => {
    const startMap: Record<
      string,
      { appointment: AppointmentWithService; endTime: string }
    > = {}
    const continuationSet = new Set<string>()

    if (data && data.length > 0) {
      for (const apt of data) {
        const requiredSlots = Math.ceil(apt.service.duration / 30)
        const startIndex = times.indexOf(apt.time)
        const endTime = calculateEndTime(apt.time, apt.service.duration)

        startMap[apt.time] = { appointment: apt, endTime }

        if (startIndex !== -1) {
          for (let i = 1; i < requiredSlots; i++) {
            const nextSlot = times[startIndex + i]
            if (nextSlot) {
              continuationSet.add(nextSlot)
            }
          }
        }
      }
    }

    return { startMap, continuationSet }
  }, [data, times])

  async function handleCancel(appointmentId: string, patientName: string) {
    const confirmed = window.confirm(
      `Deseja realmente cancelar o agendamento de ${patientName}?`
    )
    if (!confirmed) return

    const response = await cancelAppointment({ appointmentId })
    if (response.error) {
      toast.error(response.error)
      return
    }
    toast.success(response.data)
    queryClient.invalidateQueries({ queryKey: ["get-appointments"] })
    refetch()
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="space-y-4">
        {/* Resumo de métricas do dia */}
        <AppointmentsSummary
          appointments={data || []}
          selectedDate={activeDate}
        />

        {/* Card Principal da Agenda */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl font-extrabold text-emerald-950 sm:text-2xl">
                Agenda do Dia
              </CardTitle>
              <p className="text-xs text-slate-500">
                Horários e consultas marcadas para esta data
              </p>
            </div>

            <ButtonPickerAppointment />
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <ScrollArea className="h-[520px] pr-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                  ))}
                </div>
              ) : isError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center text-sm text-rose-700">
                  Não foi possível carregar os agendamentos. Verifique sua conexão e tente novamente.
                </div>
              ) : times.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="Nenhum horário de atendimento configurado"
                  description="Defina os horários em que sua clínica atende nas configurações de perfil."
                  action={
                    <Link href="/dashboard/profile">
                      <Button variant="outline" className="rounded-xl">
                        Configurar horários
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-2.5">
                  {times.map((slot) => {
                    // Se for um slot de continuação de um agendamento mais longo, não renderiza nova linha
                    if (continuationSet.has(slot)) {
                      return null
                    }

                    const match = startMap[slot]

                    if (match) {
                      const { appointment, endTime } = match
                      const cleanPhone = appointment.phone.replace(/\D/g, "")
                      const fullPhone = cleanPhone.startsWith("55")
                        ? cleanPhone
                        : `55${cleanPhone}`
                      const whatsappUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(
                        `Olá, ${appointment.name}! Entramos em contato a respeito da sua consulta marcada para ${appointment.time}.`
                      )}`

                      return (
                        <div
                          key={slot}
                          className="group relative flex flex-col gap-3 rounded-2xl border border-emerald-200/90 bg-emerald-50/30 p-3.5 transition-all duration-150 hover:border-emerald-300 hover:bg-emerald-50/60 hover:shadow-xs sm:flex-row sm:items-center sm:justify-between"
                        >
                          {/* Horário início-fim & Badge */}
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center justify-center rounded-xl bg-emerald-500 px-3 py-2 text-white shadow-xs shadow-emerald-500/25">
                              <span className="text-xs font-bold leading-none">
                                {slot}
                              </span>
                              <span className="text-[10px] opacity-80 leading-none mt-0.5">
                                até {endTime}
                              </span>
                            </div>

                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-bold text-xs text-emerald-800">
                              {getInitials(appointment.name)}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="truncate text-sm font-bold text-emerald-950">
                                  {appointment.name}
                                </h4>
                                <Badge
                                  variant="success"
                                  className="hidden sm:inline-flex text-[10px] px-2 py-0"
                                >
                                  Confirmado
                                </Badge>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                                <span>{appointment.service.name}</span>
                                <span>•</span>
                                <span className="font-semibold text-emerald-700">
                                  {formatCurrency(
                                    appointment.service.price / 100
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Ações */}
                          <div className="flex items-center justify-end gap-1.5 border-t border-emerald-100/60 pt-2 sm:border-0 sm:pt-0">
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex size-9 items-center justify-center rounded-xl border border-emerald-200 bg-white text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                              title="Conversar no WhatsApp"
                              aria-label={`Conversar com ${appointment.name} no WhatsApp`}
                            >
                              <MessageCircle className="size-4" />
                            </a>

                            <Button
                              variant="outline"
                              size="icon"
                              className="size-9 rounded-xl border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                              onClick={() => {
                                setDetailAppointment(appointment)
                                setIsDialogOpen(true)
                              }}
                              title="Ver detalhes"
                              aria-label={`Ver detalhes do agendamento de ${appointment.name}`}
                            >
                              <Eye className="size-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              onClick={() =>
                                handleCancel(appointment.id, appointment.name)
                              }
                              title="Cancelar agendamento"
                              aria-label={`Cancelar agendamento de ${appointment.name}`}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    }

                    // Slot Livre e discreto
                    return (
                      <div
                        key={slot}
                        className="flex items-center justify-between rounded-xl border border-dashed border-slate-200/90 bg-white px-3.5 py-2.5 transition-colors hover:border-emerald-300 hover:bg-emerald-50/20"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-14 font-mono text-xs font-semibold text-slate-400">
                            {slot}
                          </span>
                          <span className="text-xs text-slate-400">
                            Horário livre
                          </span>
                        </div>

                        {userId && (
                          <button
                            type="button"
                            onClick={() =>
                              openQuickAppointment({
                                date: activeDate,
                                time: slot,
                              })
                            }
                            aria-label={`Agendar horário das ${slot}`}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600"
                          >
                            <Plus className="size-3" aria-hidden />
                            <span>Agendar</span>
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <DialogAppointment
        appointment={detailAppointment}
        onClose={() => setIsDialogOpen(false)}
      />
    </Dialog>
  )
}
