"use client"

import * as React from "react"
import { ProfileFormData, useProfileForm } from "./profile-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Clock,
  Globe,
  Building2,
  Save,
  Loader2,
  Phone,
  MapPin,
} from "lucide-react"
import { Prisma } from "@/lib/generated/prisma/client"
import { updateProfile } from "../_actions/update-profile"
import { toast } from "sonner"
import { formatPhone } from "@/utils/formatPhone"
import { AvatarProfile } from "./profile-avatar"
import { Badge } from "@/components/ui/badge"
import { DEFAULT_WORKING_DAYS, WEEKDAY_OPTIONS } from "@/lib/schedule-utils"

const statusOptions = [
  { label: "Aberta (recebendo agendamentos)", value: "active" },
  { label: "Fechada temporariamente", value: "inactive" },
]

const timeZones = Intl.supportedValuesOf("timeZone").filter(
  (zone) =>
    zone.startsWith("America/Sao_Paulo") ||
    zone.startsWith("America/Fortaleza") ||
    zone.startsWith("America/Recife") ||
    zone.startsWith("America/Bahia") ||
    zone.startsWith("America/Belem") ||
    zone.startsWith("America/Manaus") ||
    zone.startsWith("America/Cuiaba") ||
    zone.startsWith("America/Boa_Vista")
)

type UserWithSubscription = Prisma.UserGetPayload<{
  include: {
    subscription: true
  }
}>

interface ProfileContentProps {
  user: UserWithSubscription
}

export function ProfileContent({ user }: ProfileContentProps) {
  const [selectedHours, setSelectedHours] = React.useState<string[]>(
    user.times ?? []
  )
  const [selectedWorkingDays, setSelectedWorkingDays] = React.useState<number[]>(
    user.workingDays ?? [...DEFAULT_WORKING_DAYS]
  )
  const [dialogIsOpen, setDialogIsOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const form = useProfileForm({
    name: user.name,
    address: user.address,
    phone: user.phone,
    status: user.status,
    timeZone: user.timeZone,
    times: user.times,
    workingDays: user.workingDays ?? [...DEFAULT_WORKING_DAYS],
  })

  function generateTimeSlots(): string[] {
    const slots: string[] = []
    for (let i = 8; i <= 22; i++) {
      for (let j = 0; j < 2; j++) {
        const hour = i.toString().padStart(2, "0")
        const minute = (j * 30).toString().padStart(2, "0")
        slots.push(`${hour}:${minute}`)
      }
    }
    return slots
  }

  const allAvailableSlots = React.useMemo(() => generateTimeSlots(), [])

  function toggleHour(hour: string) {
    setSelectedHours((prev) =>
      prev.includes(hour)
        ? prev.filter((h) => h !== hour)
        : [...prev, hour].sort()
    )
  }

  function toggleWorkingDay(dayValue: number) {
    setSelectedWorkingDays((prev) =>
      prev.includes(dayValue)
        ? prev.filter((day) => day !== dayValue)
        : [...prev, dayValue]
    )
  }

  function handleSelectAll() {
    setSelectedHours(allAvailableSlots)
  }

  function handleClearAll() {
    setSelectedHours([])
  }

  async function onSubmit(values: ProfileFormData) {
    setSaving(true)
    try {
      const response = await updateProfile({
        name: values.name,
        address: values.address,
        status: values.status === "active",
        phone: values.phone,
        timeZone: values.timeZone,
        times: selectedHours || [],
        workingDays: selectedWorkingDays,
      })

      if (response.error) {
        toast.error(response.error)
        return
      }

      toast.success(response.data || "Perfil salvo com sucesso!")
    } catch {
      toast.error("Ocorreu um erro ao atualizar o perfil.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl dark:text-emerald-50">
          Meu Perfil
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gerencie as informações da clínica, horários de funcionamento e fuso horário.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Card 1: Avatar e Dados Principais */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-lg font-extrabold text-emerald-950 dark:text-emerald-50">
                  Dados da Clínica
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Essas informações aparecem para os pacientes na sua página pública de agendamento.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <div className="flex justify-center pb-2">
                <AvatarProfile avatarUrl={user.image} userId={user.id} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Nome da clínica ou consultório:
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Clínica Odontológica Sorriso"
                          className="rounded-xl border-slate-200 dark:border-slate-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Telefone / WhatsApp:
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
                            className="rounded-xl border-slate-200 pl-9 dark:border-slate-700"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Status da clínica:
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-700">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((st) => (
                              <SelectItem key={st.value} value={st.value}>
                                {st.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Endereço completo:
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="Ex: Av. Paulista, 1000, Bela Vista - São Paulo, SP"
                            className="rounded-xl border-slate-200 pl-9 dark:border-slate-700"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Horário de Funcionamento */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <CardTitle className="text-lg font-extrabold text-emerald-950 dark:text-emerald-50">
                    Horário de Funcionamento
                  </CardTitle>
                </div>
                <Badge variant={selectedHours.length > 0 ? "success" : "muted"}>
                  {selectedHours.length} horários ativos
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Selecione os intervalos de 30 minutos em que sua clínica disponibiliza consultas.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 p-6">
              {/* Dias da semana de atendimento */}
              <div className="space-y-2.5 border-b border-slate-100 pb-5 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Dias de atendimento na semana:
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {selectedWorkingDays.length}{" "}
                    {selectedWorkingDays.length === 1 ? "dia selecionado" : "dias selecionados"}
                  </span>
                </div>

                <div
                  role="group"
                  aria-label="Dias da semana em que o consultório abre"
                  className="grid grid-cols-4 gap-2 sm:grid-cols-7"
                >
                  {WEEKDAY_OPTIONS.map((day) => {
                    const isOpen = selectedWorkingDays.includes(day.value)
                    return (
                      <button
                        key={day.value}
                        type="button"
                        aria-pressed={isOpen}
                        title={day.label}
                        onClick={() => toggleWorkingDay(day.value)}
                        className={`rounded-xl py-2 text-xs font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                          isOpen
                            ? "border border-emerald-500 bg-emerald-500 text-white shadow-2xs shadow-emerald-500/25 hover:bg-emerald-600"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-emerald-500/40 dark:hover:text-slate-200"
                        }`}
                      >
                        {day.short}
                      </button>
                    )
                  })}
                </div>

                {selectedWorkingDays.length === 0 && (
                  <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-3 text-center text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                    Nenhum dia da semana selecionado. Pacientes não conseguirão agendar em nenhum dia.
                  </div>
                )}
              </div>

              {selectedHours.length === 0 ? (
                <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4 text-center text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                  Nenhum horário de atendimento selecionado. Pacientes não conseguirão agendar horários online.
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                  {selectedHours.map((hour) => (
                    <span
                      key={hour}
                      className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 font-mono text-xs font-bold text-emerald-800 border border-emerald-200/70 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
                    >
                      {hour}
                    </span>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogIsOpen(true)}
                className="w-full rounded-xl border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/15"
              >
                Gerenciar horários disponíveis
              </Button>

              {/* Modal de Seleção de Horários */}
              <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
                <DialogContent className="max-w-xl rounded-2xl p-6">
                  <DialogHeader className="text-left">
                    <DialogTitle className="text-xl font-extrabold text-emerald-950 dark:text-emerald-50">
                      Horários de Atendimento
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                      Clique nos horários para ativar ou desativar os slots da agenda.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex items-center justify-between border-y border-slate-100 py-2.5 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {selectedHours.length} horários selecionados
                    </span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={handleSelectAll}
                        className="text-xs text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/15"
                      >
                        Selecionar todos
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={handleClearAll}
                        className="text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      >
                        Limpar
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-80 overflow-y-auto py-2 pr-1">
                    {allAvailableSlots.map((hour) => {
                      const isSelected = selectedHours.includes(hour)
                      return (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => toggleHour(hour)}
                          className={`rounded-xl py-2 font-mono text-xs font-bold transition-all duration-150 ${
                            isSelected
                              ? "bg-emerald-500 text-white shadow-2xs shadow-emerald-500/30 scale-102"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/15"
                          }`}
                        >
                          {hour}
                        </button>
                      )
                    })}
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={() => setDialogIsOpen(false)}
                      className="w-full rounded-xl bg-emerald-500 font-semibold text-white hover:bg-emerald-600 shadow-xs"
                    >
                      Confirmar horários
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Card 3: Fuso Horário */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="size-5 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-lg font-extrabold text-emerald-950 dark:text-emerald-50">
                  Fuso Horário
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Garante que os relatórios e agendamentos respeitem o horário local da sua região.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <FormField
                control={form.control}
                name="timeZone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Região / Fuso Horário:
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || "America/Sao_Paulo"}
                      >
                        <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Selecione o seu fuso horário" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeZones.map((zone) => (
                            <SelectItem key={zone} value={zone}>
                              {zone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Botão Salvar Fixo / Destacado */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="gap-2 rounded-xl bg-emerald-500 px-7 py-3 text-sm font-bold text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <span>Salvar alterações</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
