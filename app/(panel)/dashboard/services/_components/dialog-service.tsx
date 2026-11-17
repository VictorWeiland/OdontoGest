"use client"

import { useEffect, useMemo, useState } from "react"
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDialogServiceForm, DialogServiceFormData } from "./dialog-service-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { convertRealToCents } from "@/utils/convertCurrency"
import { createNewService } from "../_actions/create-service"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { updateService } from "../_actions/update-service"
import { Stethoscope } from "lucide-react"

interface DialogServiceProps {
  closeModal: () => void
  serviceId?: string
  initialValues?: {
    name: string
    price: string
    hours: string
    minutes: string
  }
}

export function DialogService({
  closeModal,
  serviceId,
  initialValues,
}: DialogServiceProps) {
  const form = useDialogServiceForm({ initialValues })
  const { reset } = form
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const formInitialValues = useMemo(
    () => ({
      name: initialValues?.name ?? "",
      price: initialValues?.price ?? "",
      hours: initialValues?.hours ?? "",
      minutes: initialValues?.minutes ?? "",
    }),
    [
      initialValues?.name,
      initialValues?.price,
      initialValues?.hours,
      initialValues?.minutes,
    ]
  )

  useEffect(() => {
    reset(formInitialValues)
  }, [formInitialValues, reset])

  async function onSubmit(values: DialogServiceFormData) {
    setLoading(true)
    const priceInCents = convertRealToCents(values.price)
    const hours = parseInt(values.hours) || 0
    const minutes = parseInt(values.minutes) || 0
    const duration = hours * 60 + minutes

    if (duration <= 0) {
      toast.error("A duração total do serviço deve ser de no mínimo 30 minutos.")
      setLoading(false)
      return
    }

    if (serviceId) {
      const response = await updateService({
        serviceId,
        name: values.name,
        price: priceInCents,
        duration,
      })

      setLoading(false)
      if (response.error) {
        toast.error(response.error)
        return
      }
      toast.success(response.data || "Serviço atualizado com sucesso!")
      handleCloseModal()
      router.refresh()
      return
    }

    const response = await createNewService({
      name: values.name,
      price: priceInCents,
      duration,
    })

    setLoading(false)
    if (response.error) {
      toast.error(response.error)
      return
    }
    toast.success("Serviço cadastrado com sucesso!")
    handleCloseModal()
    router.refresh()
  }

  function handleCloseModal() {
    form.reset()
    closeModal()
  }

  function changeCurrency(event: React.ChangeEvent<HTMLInputElement>) {
    let { value } = event.target
    value = value.replace(/\D/g, "")

    if (value) {
      value = (parseInt(value, 10) / 100).toFixed(2)
      value = value.replace(".", ",")
      value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    }
    event.target.value = value
    form.setValue("price", value)
  }

  return (
    <div className="space-y-4">
      <DialogHeader className="text-left">
        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Stethoscope className="size-5" />
        </div>
        <DialogTitle className="mt-2 text-xl font-extrabold text-emerald-950">
          {serviceId ? "Editar Serviço" : "Novo Serviço"}
        </DialogTitle>
        <DialogDescription className="text-xs text-slate-500">
          {serviceId
            ? "Atualize o nome, valor ou duração deste procedimento."
            : "Cadastre um novo procedimento odontológico oferecido na clínica."}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-slate-700">
                  Nome do procedimento:
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ex: Limpeza e Profilaxia, Clareamento Dental"
                    className="rounded-xl border-slate-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-slate-700">
                  Preço do serviço (R$):
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      R$
                    </span>
                    <Input
                      {...field}
                      placeholder="150,00"
                      className="rounded-xl border-slate-200 pl-9"
                      onChange={changeCurrency}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Tempo de duração estimado:
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="0"
                          min="0"
                          type="number"
                          aria-label="Horas de duração"
                          className="rounded-xl border-slate-200 pr-12"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          horas
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="30"
                          min="0"
                          step="15"
                          type="number"
                          aria-label="Minutos de duração"
                          className="rounded-xl border-slate-200 pr-12"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          minutos
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              A agenda é dividida em blocos de 30 minutos.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              className="flex-1 rounded-xl border-slate-200"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-emerald-500 font-semibold text-white hover:bg-emerald-600 shadow-xs"
            >
              {loading
                ? "Salvando..."
                : serviceId
                ? "Salvar alterações"
                : "Cadastrar serviço"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
