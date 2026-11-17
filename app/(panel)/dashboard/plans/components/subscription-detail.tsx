"use client"

import { useState } from "react"
import type { Subscription } from "@/lib/generated/prisma/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { subscriptionPlans, PLANS } from "@/utils/plans/index"
import { Button } from "@/components/ui/button"
import { createPortalCustomer } from "../_actions/create-potal-customer"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Check, CheckCircle2, Clock, CreditCard, ShieldCheck } from "lucide-react"

interface SubscriptionDetailProps {
  subscription: Subscription
}

export function SubscriptionDetail({ subscription }: SubscriptionDetailProps) {
  const [isLoading, setIsLoading] = useState(false)

  const subscriptionInfo = subscriptionPlans.find(
    (plan) => plan.id === subscription.plan
  )

  const planName =
    subscription.plan === "BASIC" ? "Plano Básico" : "Plano Profissional"

  const rawMax = PLANS[subscription.plan]?.maxServices
  const maxServicesText =
    rawMax === null || rawMax === undefined
      ? "Procedimentos ilimitados"
      : `Até ${rawMax} procedimentos`

  const isTrialing = subscription.status === "trialing"
  const isActive = subscription.status === "active" || isTrialing

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(subscription.createdAt))

  async function handleManageSubscription() {
    if (isLoading) return

    setIsLoading(true)
    try {
      const portal = await createPortalCustomer()
      if (portal.error) {
        toast.error(portal.error)
        return
      }

      if (portal.url) {
        window.location.href = portal.url
      } else {
        toast.error("Não foi possível abrir o gerenciamento da assinatura.")
      }
    } catch (err) {
      console.error("ERRO AO ABRIR GERENCIAMENTO DA ASSINATURA", err)
      toast.error(
        "Não foi possível abrir o gerenciamento da assinatura. Tente novamente."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-6">
      <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-xs p-2 sm:p-4">
        <CardHeader className="border-b border-slate-100 pb-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-emerald-600" />
                <CardTitle className="text-2xl font-extrabold text-emerald-950">
                  Seu Plano Atual
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500 mt-1">
                {isTrialing
                  ? "Sua clínica está em período de teste com todos os benefícios ativos."
                  : "Sua clínica está com uma assinatura ativa e regularizada."}
              </CardDescription>
            </div>

            <Badge
              variant={isActive ? "success" : "muted"}
              className="gap-1.5 px-3 py-1 text-xs self-start sm:self-auto"
            >
              <CheckCircle2 className="size-3.5" />
              {isTrialing
                ? "Período de Testes Ativo"
                : isActive
                ? "Assinatura Ativa"
                : "Inativo"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Plano Contratado
                </span>
                <h3 className="text-xl font-extrabold text-emerald-950 mt-0.5">
                  {planName}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">
                  Capacidade de serviços
                </span>
                <span className="text-sm font-extrabold text-emerald-700">
                  {maxServicesText}
                </span>
              </div>
            </div>

            <p className="mt-3 border-t border-emerald-100/60 pt-3 text-xs text-slate-500">
              Assinante desde <strong>{formattedDate}</strong>
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Recursos incluídos no seu plano:
            </h4>
            <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {subscriptionInfo?.features.map((feature, index) => {
                const isAvailable = feature.status === "available"

                return (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-xs"
                  >
                    {isAvailable ? (
                      <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="size-2.5" />
                      </div>
                    ) : (
                      <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Clock className="size-2.5" />
                      </div>
                    )}

                    <div className="flex-1">
                      <span
                        className={
                          isAvailable
                            ? "text-slate-700 font-medium"
                            : "text-slate-400 font-normal"
                        }
                      >
                        {feature.text}
                      </span>
                      {!isAvailable && (
                        <span className="ml-1.5 inline-flex rounded-md bg-slate-100 px-1 py-0.2 text-[9px] font-semibold text-slate-500">
                          Em breve
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            Alteração de cartão, cancelamento ou nota fiscal pelo portal seguro Stripe.
          </p>

          <Button
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="gap-2 rounded-xl bg-emerald-500 px-5 font-semibold text-white hover:bg-emerald-600 shadow-xs w-full sm:w-auto"
          >
            <CreditCard className="size-4" />
            {isLoading ? "Abrindo portal..." : "Gerenciar assinatura"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
