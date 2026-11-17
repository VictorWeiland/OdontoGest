"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import defaultClinicImg from "../../../../../public/foto1.png"
import {
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Stethoscope,
  User,
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react"
import type { PublicClinicSchedule } from "../_data-access/get-info-schedule"
import { useAppointmentForm, AppointmentFormData } from "./schedule-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatPhone } from "@/utils/formatPhone"
import { DateTimePicker } from "./date-picker"
import { ScheduleTimeList } from "./schedule-times-list"
import { createNewAppointment } from "../_actions/create-appointment"
import { toast } from "sonner"
import {
  formatToSaoPauloIso,
  getSaoPauloToday,
} from "./schedule-utils"
import { formatCurrency } from "@/utils/formatCurrency"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScheduleSuccess } from "./schedule-success"
import { EmptyState } from "@/components/ui/empty-state"

interface ScheduleContentProps {
  clinic: PublicClinicSchedule
}

export interface TimeSlot {
  time: string
  available: boolean
}

export function ScheduleContent({ clinic }: ScheduleContentProps) {
  const form = useAppointmentForm()
  const { watch, setValue } = form

  const selectedDate = watch("date")
  const selectedServiceId = watch("serviceId")

  // Estado dos passos (1: Serviço, 2: Data & Horário, 3: Seus Dados, 4: Sucesso)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)

  const [selectedTime, setSelectedTime] = useState("")
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [blockedTimes, setBlockedTimes] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [createdAppointment, setCreatedAppointment] = useState<{
    id: string
    patientName: string
    patientPhone: string
    serviceName: string
    servicePrice: number
    dateFormatted: string
    time: string
  } | null>(null)

  // Serviço selecionado
  const activeService = useMemo(() => {
    return clinic.services.find((s) => String(s.id) === String(selectedServiceId))
  }, [clinic.services, selectedServiceId])

  // Duração em slots de 30 min
  const requiredSlots = useMemo(() => {
    if (!activeService) return 1
    return Math.ceil(activeService.duration / 30)
  }, [activeService])

  // Busca horários ocupados ao alterar a data no fuso America/Sao_Paulo
  useEffect(() => {
    if (!selectedDate) return

    let isCurrentRequest = true

    async function loadAvailableSlots() {
      setLoadingSlots(true)
      try {
        const dateString = formatToSaoPauloIso(selectedDate)
        const params = new URLSearchParams({
          userId: clinic.id,
          date: dateString,
        })

        const response = await fetch(`/api/schedule/get-appointments?${params}`)
        if (!response.ok) {
          throw new Error(`Falha ao consultar horários (${response.status})`)
        }

        const result: unknown = await response.json()
        if (
          !Array.isArray(result) ||
          !result.every((time) => typeof time === "string")
        ) {
          throw new Error("Resposta de horários inválida")
        }

        if (!isCurrentRequest) return

        const blocked = result as string[]
        setBlockedTimes(blocked)

        const finalSlots = clinic.times.map((time) => ({
          time,
          available: !blocked.includes(time),
        }))

        setAvailableTimeSlots(finalSlots)
        setSelectedTime((currentTime) =>
          finalSlots.some((slot) => slot.time === currentTime && slot.available)
            ? currentTime
            : ""
        )
      } catch (error) {
        if (!isCurrentRequest) return
        console.error("Falha ao carregar horários da clínica:", error)
        toast.error("Não foi possível carregar os horários disponíveis.")
        setBlockedTimes([])
        setAvailableTimeSlots([])
        setSelectedTime("")
      } finally {
        if (isCurrentRequest) {
          setLoadingSlots(false)
        }
      }
    }

    void loadAvailableSlots()

    return () => {
      isCurrentRequest = false
    }
  }, [selectedDate, clinic.id, clinic.times])

  async function handleProceedToStep2(serviceId: string) {
    setValue("serviceId", serviceId)
    setSelectedTime("")
    setCurrentStep(2)
  }

  async function handleProceedToStep3() {
    if (!selectedDate) {
      toast.error("Por favor, selecione uma data para o atendimento.")
      return
    }
    if (!selectedTime) {
      toast.error("Por favor, selecione um horário disponível.")
      return
    }
    setCurrentStep(3)
  }

  async function handleRegisterAppointment(formData: AppointmentFormData) {
    if (!selectedTime) {
      toast.error("Selecione um horário disponível.")
      return
    }

    setSubmitting(true)
    try {
      const response = await createNewAppointment({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        serviceId: formData.serviceId,
        time: selectedTime,
        clinicId: clinic.id,
      })

      if (response.error || !response.data) {
        toast.error(response.error || "Erro ao realizar agendamento.")
        return
      }

      const dateFormatted = new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "full",
        timeZone: "America/Sao_Paulo",
      }).format(formData.date)

      setCreatedAppointment({
        id: response.data.id,
        patientName: formData.name,
        patientPhone: formData.phone,
        serviceName: activeService?.name || "Procedimento Odontológico",
        servicePrice: activeService?.price || 0,
        dateFormatted,
        time: selectedTime,
      })

      toast.success("Agendamento realizado com sucesso!")
      setCurrentStep(4)
    } catch {
      toast.error("Ocorreu um erro ao salvar seu agendamento.")
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    form.reset({
      name: "",
      email: "",
      phone: "",
      serviceId: "",
      date: getSaoPauloToday(),
    })
    setSelectedTime("")
    setCreatedAppointment(null)
    setCurrentStep(1)
  }

  // Se o agendamento foi concluído com sucesso, exibe a tela de confirmação
  if (currentStep === 4 && createdAppointment) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-12 px-4 sm:px-6">
        <ScheduleSuccess
          clinicName={clinic.name || "Clínica Odontológica"}
          clinicPhone={clinic.phone}
          clinicAddress={clinic.address}
          patientName={createdAppointment.patientName}
          patientPhone={createdAppointment.patientPhone}
          serviceName={createdAppointment.serviceName}
          servicePrice={createdAppointment.servicePrice}
          dateFormatted={createdAppointment.dateFormatted}
          time={createdAppointment.time}
          onReset={handleReset}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Banner & Cabeçalho da Clínica */}
      <div className="relative border-b border-slate-200/80 bg-white">
        {/* Banner Superior com Gradiente Suave */}
        <div className="h-36 sm:h-44 w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-emerald-700/30 blur-2xl"
          />
        </div>

        {/* Informações da Clínica com Avatar Perfeitamente Posicionado */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-14 mb-4">
            <div className="relative size-28 sm:size-32 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-lg ring-1 ring-slate-900/5">
              <Image
                src={clinic.image || defaultClinicImg}
                alt={`Logo de ${clinic.name || "Clínica"}`}
                fill
                priority
                className="object-cover"
                sizes="128px"
              />
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-950 truncate">
                  {clinic.name || "Clínica Odontológica"}
                </h1>
                <Badge variant={clinic.status ? "success" : "destructive"}>
                  {clinic.status ? "Aberta para agendamento" : "Fechada temporariamente"}
                </Badge>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600">
                {clinic.address && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 text-emerald-600 shrink-0" />
                    <span>{clinic.address}</span>
                  </span>
                )}
                {clinic.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="size-4 text-emerald-600 shrink-0" />
                    <span>{clinic.phone}</span>
                  </span>
                )}
                {clinic.times.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <Clock className="size-4 text-emerald-600 shrink-0" />
                    <span>
                      {clinic.times[0]} às {clinic.times[clinic.times.length - 1]}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stepper / Indicador de Progresso em 3 Passos */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {[
                { step: 1, label: "Serviço" },
                { step: 2, label: "Data e Horário" },
                { step: 3, label: "Seus Dados" },
              ].map(({ step, label }) => {
                const isCompleted = currentStep > step
                const isCurrent = currentStep === step

                return (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className={`flex size-8 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                        isCompleted
                          ? "bg-emerald-500 text-white shadow-2xs"
                          : isCurrent
                          ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border border-slate-200 bg-white text-slate-400"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="size-4" /> : step}
                    </div>
                    <span
                      className={`hidden sm:inline text-xs font-semibold ${
                        isCurrent ? "text-emerald-950 font-bold" : "text-slate-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal do Fluxo */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-8">
        {!clinic.status && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-center text-sm font-semibold text-rose-800">
            A clínica está com os agendamentos online pausados no momento.
          </div>
        )}

        {/* PASSO 1: Escolha do Serviço */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Passo 1 de 3
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 mt-0.5">
                Selecione o procedimento
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Escolha o serviço odontológico que deseja realizar nesta consulta.
              </p>
            </div>

            {clinic.services.length === 0 ? (
              <EmptyState
                icon={Stethoscope}
                title="Nenhum procedimento disponível"
                description="A clínica ainda não cadastrou procedimentos para agendamento online."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {clinic.services.map((service) => {
                  const durationHours = Math.floor(service.duration / 60)
                  const durationMins = service.duration % 60
                  const durationStr =
                    durationHours > 0
                      ? `${durationHours}h${durationMins > 0 ? ` ${durationMins}min` : ""}`
                      : `${durationMins} min`

                  const isSelected = String(selectedServiceId) === String(service.id)

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleProceedToStep2(String(service.id))}
                      className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                          : "border-slate-200/90 bg-white hover:border-emerald-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Stethoscope className="size-4" />
                          </div>
                          <span className="text-xs font-medium text-slate-500">
                            {durationStr}
                          </span>
                        </div>
                        <h3 className="mt-3 text-base font-bold text-emerald-950">
                          {service.name}
                        </h3>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-lg font-extrabold text-emerald-600">
                          {formatCurrency(service.price / 100)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          Selecionar
                          <ArrowRight className="size-3.5" />
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* PASSO 2: Escolha de Data e Horário */}
        {currentStep === 2 && activeService && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Passo 2 de 3
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 mt-0.5">
                  Escolha o dia e horário
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Procedimento: <strong>{activeService.name}</strong> (
                  {Math.floor(activeService.duration / 60) > 0
                    ? `${Math.floor(activeService.duration / 60)}h `
                    : ""}
                  {activeService.duration % 60}min)
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(1)}
                className="gap-1.5 rounded-xl border-slate-200 self-start sm:self-auto text-xs"
              >
                <ArrowLeft className="size-3.5" />
                <span>Trocar procedimento</span>
              </Button>
            </div>

            {/* Calendário */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                1. Selecione a Data da Consulta:
              </label>
              <div className="max-w-xs">
                <DateTimePicker
                  initialDate={selectedDate || getSaoPauloToday()}
                  minDate={getSaoPauloToday()}
                  onChange={(date) => {
                    setValue("date", date)
                    setSelectedTime("")
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Grade de Horários */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  2. Selecione o Horário de Atendimento:
                </label>
                {selectedTime && (
                  <Badge variant="success" className="text-xs font-bold">
                    Horário escolhido: {selectedTime}
                  </Badge>
                )}
              </div>

              {loadingSlots ? (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-10 rounded-xl" />
                  ))}
                </div>
              ) : availableTimeSlots.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="Nenhum horário disponível"
                  description="Não há horários livres configurados para a clínica nesta data."
                />
              ) : (
                <ScheduleTimeList
                  selectedDate={selectedDate || getSaoPauloToday()}
                  selectedTime={selectedTime}
                  requiredSlots={requiredSlots}
                  blockedTimes={blockedTimes}
                  availableTimeSlots={availableTimeSlots}
                  clinicTimes={clinic.times}
                  onSelectTime={(time) => setSelectedTime(time)}
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="gap-2 rounded-xl"
              >
                <ArrowLeft className="size-4" />
                <span>Voltar</span>
              </Button>

              <Button
                type="button"
                disabled={!selectedTime}
                onClick={handleProceedToStep3}
                className="gap-2 rounded-xl bg-emerald-500 font-bold text-white hover:bg-emerald-600 shadow-xs"
              >
                <span>Avançar para identificação</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* PASSO 3: Dados do Paciente e Confirmação */}
        {currentStep === 3 && activeService && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Passo 3 de 3
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 mt-0.5">
                Seus dados de contato
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Preencha seus dados para que a clínica possa confirmar o agendamento.
              </p>
            </div>

            {/* Resumo do que foi escolhido */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-emerald-100/70 pb-3">
                <span className="text-xs font-bold text-emerald-900 uppercase">
                  Resumo da Consulta
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {clinic.name}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                <div>
                  <p className="text-[11px] text-slate-500">Procedimento</p>
                  <p className="font-bold text-emerald-950">{activeService.name}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Data</p>
                  <p className="font-bold text-emerald-950 capitalize">
                    {new Intl.DateTimeFormat("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(selectedDate)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Horário e Valor</p>
                  <p className="font-bold text-emerald-600">
                    {selectedTime} • {formatCurrency(activeService.price / 100)}
                  </p>
                </div>
              </div>
            </div>

            {/* Formulário dos Dados */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleRegisterAppointment)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700">
                          Nome completo:
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <Input
                              {...field}
                              placeholder="Digite seu nome completo"
                              className="rounded-xl border-slate-200 pl-9"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-700">
                            Telefone celular / WhatsApp:
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                              <Input
                                {...field}
                                value={field.value || ""}
                                onChange={(e) =>
                                  field.onChange(formatPhone(e.target.value))
                                }
                                placeholder="(11) 99999-9999"
                                className="rounded-xl border-slate-200 pl-9"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-700">
                            E-mail de confirmação:
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                              <Input
                                {...field}
                                type="email"
                                placeholder="seuemail@exemplo.com"
                                className="rounded-xl border-slate-200 pl-9"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                    <span>
                      Seus dados são protegidos conforme a LGPD e usados exclusivamente para confirmação do atendimento.
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="gap-2 rounded-xl"
                    >
                      <ArrowLeft className="size-4" />
                      <span>Voltar</span>
                    </Button>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="gap-2 rounded-xl bg-emerald-500 px-6 font-bold text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/25"
                    >
                      {submitting ? (
                        "Confirmando..."
                      ) : (
                        <>
                          <CheckCircle2 className="size-4" />
                          <span>Finalizar Agendamento</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
