"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Reminder } from "@/lib/generated/prisma/client"
import { Plus, Trash2, BellRing, Check } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { deleteReminder } from "../../_actions/delete-reminder"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { ReminderContent } from "./reminder-content"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"

interface ReminderListProps {
  reminder: Reminder[]
}

export function ReminderList({ reminder }: ReminderListProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  function toggleComplete(id: string) {
    setCompletedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleDeleteReminder(id: string) {
    const response = await deleteReminder({ reminderId: id })
    if (response.error) {
      toast.error(response.error)
      return
    }
    toast.success("Lembrete removido")
    router.refresh()
  }

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <CardTitle className="text-xl font-extrabold text-emerald-950 sm:text-2xl dark:text-emerald-50">
            Lembretes
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Anotações rápidas e tarefas da clínica
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger
            render={
              <Button
                size="sm"
                className="gap-1.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs"
              >
                <Plus className="size-4" />
                <span>Novo</span>
              </Button>
            }
          />

          <DialogContent className="sm:max-w-md rounded-2xl p-6">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-extrabold text-emerald-950 dark:text-emerald-50">
                Novo Lembrete
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Crie um lembrete importante para a rotina da clínica.
              </DialogDescription>
            </DialogHeader>
            <ReminderContent closeDialog={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {reminder.length === 0 ? (
          <EmptyState
            icon={BellRing}
            title="Nenhum lembrete pendente"
            description="Use este espaço para anotar recados, reposição de materiais ou avisos da equipe."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
                className="gap-1.5 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/15"
              >
                <Plus className="size-4" />
                Criar primeiro lembrete
              </Button>
            }
          />
        ) : (
          <ScrollArea className="h-[520px] pr-2">
            <div className="space-y-2.5">
              {reminder.map((item) => {
                const isCompleted = completedIds.has(item.id)

                return (
                  <article
                    key={item.id}
                    className={cn(
                      "group flex items-start justify-between gap-3 rounded-2xl border p-3.5 transition-all duration-150",
                      isCompleted
                        ? "border-slate-200 bg-slate-50/70 opacity-60 dark:border-slate-800 dark:bg-slate-800/40"
                        : "border-amber-200/80 bg-amber-50/40 hover:border-amber-300 hover:bg-amber-50/70 dark:border-amber-500/25 dark:bg-amber-500/10 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/15"
                    )}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleComplete(item.id)}
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                          isCompleted
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-300 bg-white hover:border-emerald-500 dark:border-slate-600 dark:bg-slate-800"
                        )}
                        aria-label={
                          isCompleted
                            ? "Marcar como pendente"
                            : "Marcar como concluído"
                        }
                      >
                        {isCompleted && <Check className="size-3.5" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-sm leading-relaxed text-slate-800 break-words dark:text-slate-100",
                            isCompleted && "line-through text-slate-400 dark:text-slate-500"
                          )}
                        >
                          {item.description}
                        </p>
                        <span className="text-[11px] text-slate-400 mt-1 block dark:text-slate-500">
                          Criado em{" "}
                          {new Intl.DateTimeFormat("pt-BR", {
                            day: "2-digit",
                            month: "short",
                          }).format(new Date(item.createdAt))}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg dark:hover:bg-rose-500/15 dark:hover:text-rose-400"
                      onClick={() => handleDeleteReminder(item.id)}
                      title="Excluir lembrete"
                      aria-label="Excluir lembrete"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </article>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
