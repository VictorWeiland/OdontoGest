"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DialogService } from "./dialog-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Pencil,
  Plus,
  Trash2,
  Stethoscope,
  Clock,
  Sparkles,
  Power,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { Service } from "@/lib/generated/prisma/client"
import { formatCurrency } from "@/utils/formatCurrency"
import { deleteService } from "../_actions/delete-service"
import { toggleServiceStatus } from "../_actions/toggle-service-status"
import { toast } from "sonner"
import { ResultPermissionProps } from "@/utils/permissions/canPermission"
import Link from "next/link"
import { TRIAL_MAX_SERVICES } from "@/utils/permissions/trial-limits"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { useRouter } from "next/navigation"

interface ServiceListProps {
  services: Service[]
  permission: ResultPermissionProps
}

export function ServiceList({ services, permission }: ServiceListProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<null | Service>(null)

  // Estado para modal de confirmação de exclusão
  const [serviceToDelete, setServiceToDelete] = useState<null | Service>(null)
  const [deleting, setDeleting] = useState(false)

  const rawMax = permission.plan?.maxServices
  const isUnlimited = Boolean(permission.plan && rawMax === null)
  const maxServices = isUnlimited ? Infinity : (rawMax ?? TRIAL_MAX_SERVICES)
  const serviceCount = services.length
  const limitReached = !isUnlimited && serviceCount >= maxServices

  // Exibe apenas até o limite permitido caso não tenha permissão ilimitada
  const displayServices = permission.hasPermission || isUnlimited
    ? services
    : services.slice(0, maxServices)

  async function handleConfirmDelete() {
    if (!serviceToDelete) return

    setDeleting(true)
    try {
      const response = await deleteService({ serviceId: serviceToDelete.id })
      if (response.error) {
        toast.error(response.error)
        return
      }
      toast.success(response.data || "Serviço excluído com sucesso!")
      setServiceToDelete(null)
      router.refresh()
    } catch {
      toast.error("Erro ao excluir o serviço.")
    } finally {
      setDeleting(false)
    }
  }

  async function handleToggleStatus(service: Service) {
    const nextStatus = !service.status
    const response = await toggleServiceStatus({
      serviceId: service.id,
      status: nextStatus,
    })

    if (response.error) {
      toast.error(response.error)
      return
    }
    toast.success(response.data)
    router.refresh()
  }

  function handleEditService(service: Service) {
    setEditingService(service)
    setIsDialogOpen(true)
  }

  function handleDialogChange(open: boolean) {
    setIsDialogOpen(open)
    if (!open) {
      setEditingService(null)
    }
  }

  function formatDuration(minutes: number) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0 && m > 0) return `${h}h ${m}min`
    if (h > 0) return `${h}h`
    return `${m}min`
  }

  return (
    <div className="space-y-6">
      {/* Banner de Indicador de Limite do Plano */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide dark:text-slate-400">
                Uso do Plano
              </span>
              <Badge variant={limitReached ? "warning" : "secondary"}>
                {isUnlimited
                  ? `${serviceCount} procedimentos (Ilimitado)`
                  : `${serviceCount} de ${maxServices} serviços`}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {permission.expired
                ? "Seu período de teste gratuito expirou. Escolha um plano para continuar cadastrando serviços."
                : isUnlimited
                ? "Seu plano permite cadastrar procedimentos sem limite."
                : limitReached
                ? "Você atingiu o limite de serviços do seu plano atual."
                : `Você pode cadastrar mais ${maxServices - serviceCount} serviço(s).`}
            </p>
          </div>

          {!permission.hasPermission && !isUnlimited && (
            <Link
              href="/dashboard/plans"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-600 shadow-2xs"
            >
              <Sparkles className="size-3.5" />
              <span>Aumentar limite no Profissional</span>
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>

        {/* Barra de progresso */}
        {!isUnlimited && (
          <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                limitReached ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{
                width: `${Math.min((serviceCount / maxServices) * 100, 100)}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Card da Lista de Serviços */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <div>
              <CardTitle className="text-xl font-extrabold text-emerald-950 sm:text-2xl dark:text-emerald-50">
                Serviços Cadastrados
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gerencie procedimentos, durações e valores para agendamento online.
              </p>
            </div>

            {permission.hasPermission ? (
              <DialogTrigger
                render={
                  <Button
                    onClick={() => setEditingService(null)}
                    className="gap-1.5 rounded-xl bg-emerald-500 font-semibold text-white hover:bg-emerald-600 shadow-xs"
                  >
                    <Plus className="size-4" />
                    <span>Novo serviço</span>
                  </Button>
                }
              />
            ) : (
              <Link href="/dashboard/plans">
                <Button
                  variant="outline"
                  className="gap-1.5 rounded-xl border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-semibold dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-500/15"
                >
                  <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400" />
                  Upgrade de plano
                </Button>
              </Link>
            )}

            <DialogContent className="sm:max-w-md rounded-2xl p-6">
              <DialogService
                key={editingService?.id ?? "new-service"}
                closeModal={() => {
                  setIsDialogOpen(false)
                  setEditingService(null)
                }}
                serviceId={editingService ? editingService.id : undefined}
                initialValues={
                  editingService
                    ? {
                        name: editingService.name,
                        price: (editingService.price / 100)
                          .toFixed(2)
                          .replace(".", ","),
                        hours: Math.floor(editingService.duration / 60).toString(),
                        minutes: (editingService.duration % 60).toString(),
                      }
                    : undefined
                }
              />
            </DialogContent>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {displayServices.length === 0 ? (
              <EmptyState
                icon={Stethoscope}
                title="Nenhum serviço cadastrado"
                description="Cadastre os procedimentos odontológicos oferecidos pela sua clínica para que seus pacientes possam agendar horários online."
                action={
                  permission.hasPermission && (
                    <Button
                      onClick={() => {
                        setEditingService(null)
                        setIsDialogOpen(true)
                      }}
                      className="gap-1.5 rounded-xl bg-emerald-500 font-semibold text-white hover:bg-emerald-600 shadow-xs"
                    >
                      <Plus className="size-4" />
                      Adicionar primeiro serviço
                    </Button>
                  )
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {displayServices.map((service) => (
                  <article
                    key={service.id}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-emerald-500/50"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-2xs dark:bg-emerald-500/15 dark:text-emerald-400">
                          <Stethoscope className="size-4" />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(service)}
                            title={
                              service.status
                                ? "Desativar serviço (não aparecerá para pacientes)"
                                : "Ativar serviço"
                            }
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
                              service.status
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                            }`}
                          >
                            <Power className="size-3" />
                            {service.status ? "Ativo" : "Inativo"}
                          </button>
                        </div>
                      </div>

                      <h4 className="mt-3 font-bold text-base text-emerald-950 line-clamp-1 dark:text-emerald-50">
                        {service.name}
                      </h4>

                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="size-3.5 text-slate-400" />
                        <span>Duração: {formatDuration(service.duration)}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-none dark:text-slate-500">
                          Valor
                        </span>
                        <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(service.price / 100)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditService(service)}
                          className="size-8 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-300"
                          title="Editar serviço"
                          aria-label={`Editar ${service.name}`}
                        >
                          <Pencil className="size-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setServiceToDelete(service)}
                          className="size-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15 dark:hover:text-rose-400"
                          title="Excluir serviço"
                          aria-label={`Excluir ${service.name}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog
        open={Boolean(serviceToDelete)}
        onOpenChange={(open) => !open && setServiceToDelete(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader className="text-left">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
              <AlertTriangle className="size-6" />
            </div>
            <DialogTitle className="mt-3 text-lg font-extrabold text-emerald-950 dark:text-emerald-50">
              Excluir Serviço
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Tem certeza que deseja excluir o serviço{" "}
              <strong>&ldquo;{serviceToDelete?.name}&rdquo;</strong>? Essa ação é
              irreversível e removerá o procedimento da sua lista de agendamentos.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setServiceToDelete(null)}
              className="rounded-xl border-slate-200 dark:border-slate-700"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="rounded-xl font-semibold"
            >
              {deleting ? "Excluindo..." : "Sim, excluir serviço"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
