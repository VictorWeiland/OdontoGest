import getSession from '@/lib/getSession'
import { redirect } from 'next/navigation'
import { ButtonCopyLink } from './_components/button-copy-link'
import { Reminders } from './_components/reminder/reminders'
import { Appointments } from './_components/appointments/appointments'
import { checkSubscription } from '@/utils/permissions/checkSubscription'
import { LabelSubcription } from '@/components/ui/label-subscription'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function Dashboard() {
  const session = await getSession()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const subscription = await checkSubscription(session.user.id)

  return (
    <div className="space-y-6">
      {/* Barra de Ações Rápidas */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl dark:text-emerald-50">
            Visão Geral
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Acompanhe suas consultas de hoje e anotações rápidas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ButtonCopyLink userId={session.user.id} />
        </div>
      </div>

      {/* Avisos de Assinatura */}
      {subscription.subscriptionStatus === "EXPIRED" && (
        <LabelSubcription expired={true} />
      )}

      {subscription.subscriptionStatus === "TRIAL" && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-emerald-900 shadow-2xs dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-2xs">
              <Sparkles className="size-4" />
            </div>
            <p className="text-xs sm:text-sm font-medium">
              {subscription.message}
            </p>
          </div>
          <Link
            href="/dashboard/plans"
            className="shrink-0 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Ver planos
          </Link>
        </div>
      )}

      {/* Grid Principal: Agendamentos e Lembretes */}
      {subscription.subscriptionStatus !== "EXPIRED" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Appointments userId={session.user.id} />
          </div>
          <div>
            <Reminders userId={session.user.id} />
          </div>
        </div>
      )}
    </div>
  )
}
