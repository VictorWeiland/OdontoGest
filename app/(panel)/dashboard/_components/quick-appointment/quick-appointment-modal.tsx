"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Calendar, CheckCircle2, Loader2, Stethoscope } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/utils/formatCurrency"
import {
  formatDurationLabel,
  formatToSaoPauloIso,
  getSaoPauloToday,
  getWeekdayLabel,
  isClinicOpenOnDate,
  isSlotInThePast,
  isSlotSequenceAvailable,
} from "@/lib/schedule-utils"
import { formatAppointmentFullDate } from "@/utils/whatsapp"
import {
  createQuickAppointment,
  getQuickAppointmentContext,
} from "../../_actions/quick-appointment"
import {
  quickAppointmentSchema,
  type QuickAppointmentContextData,
  type QuickAppointmentFormData,
  type QuickAppointmentSuccessData,
} from "../../_schemas/quick-appointment"
import { PatientSearchField } from "./patient-search-field"
import { QuickTimeSlotPicker } from "./quick-time-slot-picker"
import { QuickAppointmentSuccess } from "./quick-appointment-success"

interface OpenQuickAppointmentOptions {
  date?: string
  time?: string
}

interface QuickAppointmentContextValue {
  openQuickAppointment: (options?: OpenQuickAppointmentOptions) => void
}

const QuickAppointmentContext = createContext<QuickAppointmentContextValue | null>(
  null
)

export function useQuickAppointment() {
  const ctx = useContext(QuickAppointmentContext)
  if (!ctx) {
    throw new Error(
      "useQuickAppointment deve ser usado dentro de QuickAppointmentProvider"
    )
  }
  return ctx
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [breakpoint])

  return isMobile
}

export function QuickAppointmentProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()

  const [open, setOpen] = useState(false)
  const [contextData, setContextData] =
    useState<QuickAppointmentContextData | null>(null)
  const [loadingContext, setLoadingContext] = useState(false)
  const [contextError, setContextError] = useState<string | null>(null)

  const [blockedTimes, setBlockedTimes] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotsRefreshKey, setSlotsRefreshKey] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successData, setSuccessData] =
    useState<QuickAppointmentSuccessData | null>(null)

  const firstInputRef = useRef<HTMLInputElement | null>(null)

  const todayIso = formatToSaoPauloIso(getSaoPauloToday())

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuickAppointmentFormData>({
    resolver: zodResolver(quickAppointmentSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      serviceId: "",
      date: todayIso,
      time: "",
    },
  })

  const selectedServiceId = useWatch({ control, name: "serviceId" })
  const selectedDate = useWatch({ control, name: "date" })
  const selectedTime = useWatch({ control, name: "time" })

  const selectedService = useMemo(() => {
    return contextData?.services.find((s) => s.id === selectedServiceId) ?? null
  }, [contextData?.services, selectedServiceId])

  const requiredSlots = useMemo(() => {
    if (!selectedService) return 1
    return Math.ceil(selectedService.duration / 30)
  }, [selectedService])

  const isSelectedDateOpen = useMemo(() => {
    if (!contextData || !selectedDate) return true
    return isClinicOpenOnDate(selectedDate, contextData.workingDays)
  }, [contextData, selectedDate])

  const openQuickAppointment = useCallback(
    async (options?: OpenQuickAppointmentOptions) => {
      const currentTodayIso = formatToSaoPauloIso(getSaoPauloToday())
      const agendaDateParam =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("date")
          : null
      const candidateDate = options?.date || agendaDateParam || currentTodayIso
      const initialDate =
        candidateDate >= currentTodayIso ? candidateDate : currentTodayIso
      const initialTime = options?.time || ""

      setSubmitError(null)
      setContextError(null)
      setSuccessData(null)
      reset({
        name: "",
        phone: "",
        email: "",
        serviceId: "",
        date: initialDate,
        time: initialTime,
      })
      setOpen(true)

      setLoadingContext(true)
      try {
        const result = await getQuickAppointmentContext()
        if (result.error || !result.data) {
          setContextError(
            result.error || "Não foi possível carregar os dados da clínica."
          )
          return
        }
        setContextData(result.data)
        if (result.data.services.length > 0) {
          setValue("serviceId", result.data.services[0].id)
        }
      } catch {
        setContextError("Erro ao carregar serviços e pacientes.")
      } finally {
        setLoadingContext(false)
      }
    },
    [reset, setValue]
  )

  // Foca o primeiro campo ao abrir o modal
  useEffect(() => {
    if (!open || loadingContext || successData) return
    const timer = setTimeout(() => {
      firstInputRef.current?.focus()
    }, 60)
    return () => clearTimeout(timer)
  }, [open, loadingContext, successData])

  const selectedTimeRef = useRef(selectedTime)
  useEffect(() => {
    selectedTimeRef.current = selectedTime
  }, [selectedTime])

  // Carrega horários ocupados sempre que abrir, mudar a data ou recarregar após conflito
  useEffect(() => {
    if (
      !open ||
      !contextData?.clinicId ||
      !selectedDate ||
      !isClinicOpenOnDate(selectedDate, contextData.workingDays)
    ) {
      return
    }

    let active = true

    async function fetchBlockedSlots() {
      setLoadingSlots(true)
      try {
        const params = new URLSearchParams({
          userId: contextData!.clinicId,
          date: selectedDate,
        })
        const res = await fetch(
          `/api/schedule/get-appointments?${params.toString()}`,
          { cache: "no-store" }
        )
        if (!res.ok) throw new Error("Falha ao buscar horários")

        const json: unknown = await res.json()
        const blocked = Array.isArray(json)
          ? json.filter((item): item is string => typeof item === "string")
          : []

        if (!active) return
        setBlockedTimes(blocked)

        const currentTime = selectedTimeRef.current
        if (currentTime) {
          const valid =
            isSlotSequenceAvailable(
              currentTime,
              requiredSlots,
              contextData!.times,
              blocked
            ) && !isSlotInThePast(currentTime, selectedDate)
          if (!valid) {
            setValue("time", "")
          }
        }
      } catch {
        if (!active) return
        setBlockedTimes([])
        toast.error("Não foi possível verificar os horários ocupados.")
      } finally {
        if (active) setLoadingSlots(false)
      }
    }

    void fetchBlockedSlots()

    return () => {
      active = false
    }
  }, [open, contextData, selectedDate, slotsRefreshKey, requiredSlots, setValue])

  async function onSubmit(formData: QuickAppointmentFormData) {
    setSubmitError(null)

    const result = await createQuickAppointment(formData)

    if (result.error || !result.data) {
      const errorMsg = result.error || "Não foi possível salvar o agendamento."
      setSubmitError(errorMsg)
      toast.error(errorMsg)

      if (result.conflict) {
        setValue("time", "")
        setSlotsRefreshKey((k) => k + 1)
      }
      return
    }

    toast.success("Agendamento realizado com sucesso!")
    setSuccessData(result.data)

    // Atualiza a lista sem recarregar a página
    await queryClient.invalidateQueries({ queryKey: ["get-appointments"] })
    router.refresh()

    // Se a data agendada for diferente da exibida na agenda, leva para essa data
    const currentAgendaDate =
      new URLSearchParams(window.location.search).get("date") || todayIso
    if (pathname === "/dashboard" && result.data.dateIso !== currentAgendaDate) {
      const url = new URL(window.location.href)
      url.searchParams.set("date", result.data.dateIso)
      router.push(`${url.pathname}${url.search}`)
    }
  }

  function handleResetForNew() {
    const keepDate = successData?.dateIso || todayIso
    setSuccessData(null)
    setSubmitError(null)
    reset({
      name: "",
      phone: "",
      email: "",
      serviceId: contextData?.services[0]?.id || "",
      date: keepDate,
      time: "",
    })
    setSlotsRefreshKey((k) => k + 1)
  }

  const modalBody = loadingContext ? (
    <div className="space-y-4 py-2">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-11 w-full rounded-xl" />
      <Skeleton className="h-11 w-full rounded-xl" />
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 rounded-xl" />
        ))}
      </div>
    </div>
  ) : contextError ? (
    <div className="space-y-4 py-4 text-center">
      <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200">
        {contextError}
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={() => openQuickAppointment()}
        className="rounded-xl"
      >
        Tentar novamente
      </Button>
    </div>
  ) : successData ? (
    <QuickAppointmentSuccess
      appointment={successData}
      onNewAppointment={handleResetForNew}
      onClose={() => setOpen(false)}
    />
  ) : contextData && !contextData.clinicStatus ? (
    <div className="space-y-4 rounded-2xl border border-rose-200 bg-rose-50/70 p-5 text-center dark:border-rose-500/30 dark:bg-rose-950/30">
      <AlertCircle className="mx-auto size-8 text-rose-600 dark:text-rose-400" aria-hidden />
      <div>
        <h3 className="text-base font-bold text-rose-950 dark:text-rose-100">
          Clínica temporariamente inativa
        </h3>
        <p className="mt-1 text-xs text-rose-800/90 dark:text-rose-200/80">
          Sua clínica está fechada temporariamente e não pode receber novos agendamentos. Ative o recebimento em Meu Perfil para continuar.
        </p>
      </div>
      <Link href="/dashboard/profile" onClick={() => setOpen(false)}>
        <Button className="rounded-xl bg-emerald-500 font-semibold text-white hover:bg-emerald-600">
          Ativar clínica em Meu Perfil
        </Button>
      </Link>
    </div>
  ) : contextData && contextData.services.length === 0 ? (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center dark:border-slate-800 dark:bg-slate-900/70">
      <Stethoscope className="mx-auto size-8 text-emerald-600 dark:text-emerald-400" aria-hidden />
      <div>
        <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-50">
          Nenhum serviço ativo encontrado
        </h3>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Cadastre ou ative ao menos um procedimento para realizar agendamentos rápidos.
        </p>
      </div>
      <Link href="/dashboard/services" onClick={() => setOpen(false)}>
        <Button className="rounded-xl bg-emerald-500 font-semibold text-white hover:bg-emerald-600">
          Ir para Serviços
        </Button>
      </Link>
    </div>
  ) : contextData && contextData.times.length === 0 ? (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center dark:border-slate-800 dark:bg-slate-900/70">
      <Calendar className="mx-auto size-8 text-emerald-600 dark:text-emerald-400" aria-hidden />
      <div>
        <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-50">
          Horários da clínica não configurados
        </h3>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Configure os horários de atendimento no seu perfil antes de agendar.
        </p>
      </div>
      <Link href="/dashboard/profile" onClick={() => setOpen(false)}>
        <Button className="rounded-xl bg-emerald-500 font-semibold text-white hover:bg-emerald-600">
          Configurar horários
        </Button>
      </Link>
    </div>
  ) : contextData && contextData.workingDays.length === 0 ? (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center dark:border-slate-800 dark:bg-slate-900/70">
      <Calendar className="mx-auto size-8 text-emerald-600 dark:text-emerald-400" aria-hidden />
      <div>
        <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-50">
          Nenhum dia da semana configurado
        </h3>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Selecione os dias em que o consultório abre no seu perfil antes de agendar.
        </p>
      </div>
      <Link href="/dashboard/profile" onClick={() => setOpen(false)}>
        <Button className="rounded-xl bg-emerald-500 font-semibold text-white hover:bg-emerald-600">
          Configurar dias de atendimento
        </Button>
      </Link>
    </div>
  ) : contextData ? (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div aria-live="polite">
        {submitError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
          >
            {submitError}
          </div>
        )}
      </div>

      {/* 1. Paciente */}
      <PatientSearchField
        patients={contextData.patients}
        register={register}
        control={control}
        setValue={setValue}
        errors={errors}
        disabled={isSubmitting}
        firstInputRef={firstInputRef}
      />

      {/* 2. Serviço e 3. Data */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="space-y-1.5 min-w-0">
          <Label htmlFor="quick-service" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            2. Serviço *
          </Label>
          <Select
            value={selectedServiceId}
            onValueChange={(value) => {
              const nextServiceId = value ?? ""
              setValue("serviceId", nextServiceId, { shouldValidate: true })
              const nextService = contextData.services.find(
                (s) => s.id === nextServiceId
              )
              if (nextService && selectedTime) {
                const nextReqSlots = Math.ceil(nextService.duration / 30)
                const stillValid = isSlotSequenceAvailable(
                  selectedTime,
                  nextReqSlots,
                  contextData.times,
                  blockedTimes
                )
                if (!stillValid) {
                  setValue("time", "")
                }
              }
            }}
          >
            <SelectTrigger
              id="quick-service"
              aria-invalid={Boolean(errors.serviceId)}
              className="data-[size=default]:h-10 w-full rounded-xl border-slate-200 bg-white text-sm focus-visible:border-emerald-500 focus-visible:ring-emerald-500/25 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <SelectValue placeholder="Selecione um serviço">
                {(val: string) => {
                  const found = contextData.services.find((s) => s.id === val)
                  if (!found) return "Selecione um serviço"
                  return `${found.name} • ${formatCurrency(found.price / 100)}`
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              align="start"
              alignItemWithTrigger={false}
              className="rounded-xl"
            >
              {contextData.services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  <span>
                    {service.name} — {formatDurationLabel(service.duration)} •{" "}
                    {formatCurrency(service.price / 100)}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.serviceId && (
            <p className="text-xs font-medium text-red-700 dark:text-red-400" role="alert">
              {errors.serviceId.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 min-w-0">
          <Label htmlFor="quick-date" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            3. Data *
          </Label>
          <Input
            id="quick-date"
            type="date"
            min={todayIso}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.date)}
            className="h-10 rounded-xl border-slate-200 bg-white text-sm focus-visible:border-emerald-500 focus-visible:ring-emerald-500/25 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={selectedDate}
            onChange={(e) => {
              const nextDate = e.target.value
              if (!nextDate) return
              setValue("date", nextDate, { shouldValidate: true })
              setValue("time", "")
            }}
          />
          {errors.date && (
            <p className="text-xs font-medium text-red-700 dark:text-red-400" role="alert">
              {errors.date.message}
            </p>
          )}
        </div>
      </div>

      {/* 4. Horários livres */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            4. Horário livre *
          </Label>
          {selectedService && (
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Duração: {formatDurationLabel(selectedService.duration)}
            </span>
          )}
        </div>

        {!isSelectedDateOpen ? (
          <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/70 px-3.5 py-4 text-xs font-medium text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
            O consultório não abre neste dia ({getWeekdayLabel(selectedDate)}). Escolha outro dia da semana.
          </div>
        ) : (
          <QuickTimeSlotPicker
            clinicTimes={contextData.times}
            blockedTimes={blockedTimes}
            requiredSlots={requiredSlots}
            selectedDateIso={selectedDate}
            selectedTime={selectedTime}
            loading={loadingSlots}
            onSelectTime={(time) => {
              setValue("time", time, { shouldValidate: true })
              setSubmitError(null)
            }}
            errorMessage={errors.time?.message}
          />
        )}
      </div>

      {/* Resumo antes de confirmar */}
      {selectedService && selectedDate && (
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 text-xs dark:border-emerald-500/25 dark:bg-emerald-950/30">
          <p className="font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
            Resumo do agendamento
          </p>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-slate-700 dark:text-slate-300">
            <div className="min-w-0">
              <span className="text-slate-500 dark:text-slate-400">Serviço: </span>
              <span className="font-semibold text-emerald-950 truncate dark:text-emerald-50">
                {selectedService.name}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Duração: </span>
              <span className="font-semibold text-emerald-950 dark:text-emerald-50">
                {formatDurationLabel(selectedService.duration)}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-500 dark:text-slate-400">Data: </span>
              <span className="font-semibold text-emerald-950 dark:text-emerald-50">
                {formatAppointmentFullDate(selectedDate)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Horário: </span>
              <span className="font-semibold text-emerald-950 dark:text-emerald-50">
                {selectedTime || "Selecione acima"}
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-emerald-100 pt-2 dark:border-emerald-500/20">
            <span className="font-medium text-slate-600 dark:text-slate-300">Valor total</span>
            <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(selectedService.price / 100)}
            </span>
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:justify-end dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => setOpen(false)}
          className="h-10 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 sm:w-28 dark:border-slate-700 dark:text-slate-200"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || loadingSlots || !isSelectedDateOpen}
          className="h-10 gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-bold text-white shadow-xs shadow-emerald-500/25 transition-colors hover:bg-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600 sm:min-w-36"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              <span>Agendando...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" aria-hidden />
              <span>Agendar</span>
            </>
          )}
        </Button>
      </div>
    </form>
  ) : null

  return (
    <QuickAppointmentContext.Provider value={{ openQuickAppointment }}>
      {children}

      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-t-2xl p-0"
          >
            <SheetHeader className="border-b border-slate-100 px-5 py-4 text-left dark:border-slate-800">
              <SheetTitle className="text-lg font-extrabold text-emerald-950 dark:text-emerald-50">
                Agendamento rápido
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-500 dark:text-slate-400">
                Cadastre uma consulta direto pelo painel da clínica.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-5 py-4">{modalBody}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="flex max-h-[90vh] w-full max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[520px]">
            <DialogHeader className="border-b border-slate-100 px-6 py-4 text-left dark:border-slate-800">
              <DialogTitle className="text-xl font-extrabold text-emerald-950 dark:text-emerald-50">
                Agendamento rápido
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Cadastre uma consulta sem sair do painel da clínica.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">{modalBody}</div>
          </DialogContent>
        </Dialog>
      )}
    </QuickAppointmentContext.Provider>
  )
}
