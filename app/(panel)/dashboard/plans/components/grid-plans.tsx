"use client"

import { useState } from "react"
import {
  subscriptionPlans,
  PLAN_FEATURES,
  PlanId,
} from "@/utils/plans/index"
import { SubscriptionButton } from "./subscription-button"
import {
  Check,
  Clock,
  Sparkles,
  Building2,
  Minus,
} from "lucide-react"

export function GridPlans() {
  const trialDays = Number(process.env.NEXT_PUBLIC_TRIAL_DAYS || 0)

  // Variáveis para plano anual (exibido apenas se os preços anuais estiverem configurados)
  const hasYearlyBasic = Boolean(
    process.env.NEXT_PUBLIC_STRIPE_PLAN_BASIC_YEARLY ||
      process.env.STRIPE_PLAN_BASIC_YEARLY
  )
  const hasYearlyPro = Boolean(
    process.env.NEXT_PUBLIC_STRIPE_PLAN_PROFISSIONAL_YEARLY ||
      process.env.STRIPE_PLAN_PROFISSIONAL_YEARLY
  )
  const canShowYearlyToggle = hasYearlyBasic && hasYearlyPro

  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

  return (
    <div className="mx-auto max-w-6xl space-y-12 py-4">
      {/* Faixa de Teste Grátis (apenas se NEXT_PUBLIC_TRIAL_DAYS > 0) */}
      {trialDays > 0 && (
        <div className="mx-auto flex max-w-2xl items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-900 shadow-xs dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-100">
          <Sparkles className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            Experimente qualquer plano por <strong>{trialDays} dias grátis</strong>.
            Sem cobrança imediata, cancele quando quiser.
          </span>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
          <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          Planos transparentes e flexíveis
        </span>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl dark:text-emerald-50">
          Escolha o plano ideal para a sua clínica
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base dark:text-slate-400">
          Profissionalize o agendamento de consultas, automatize confirmações e tenha
          controle completo da sua clínica odontológica.
        </p>

        {/* Alternador Mensal / Anual (só se configurado em variáveis de ambiente) */}
        {canShowYearlyToggle && (
          <div className="mt-6 inline-flex items-center rounded-full border border-slate-200 bg-slate-100 p-1 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              className={`rounded-full px-4 py-1.5 transition-all ${
                billingPeriod === "monthly"
                  ? "bg-white text-emerald-900 shadow-xs dark:bg-slate-800 dark:text-emerald-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Faturamento Mensal
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("yearly")}
              className={`rounded-full px-4 py-1.5 transition-all ${
                billingPeriod === "yearly"
                  ? "bg-white text-emerald-900 shadow-xs dark:bg-slate-800 dark:text-emerald-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Faturamento Anual
            </button>
          </div>
        )}
      </div>

      {/* Grid de Cards dos 3 Planos */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-stretch">
        {subscriptionPlans.map((plan) => {
          const isPro = plan.id === "PROFESSIONAL"
          const isEnterprise = plan.id === "ENTERPRISE"

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900 ${
                isPro
                  ? "border-2 border-emerald-500 shadow-md shadow-emerald-500/10"
                  : "border border-slate-200/90 dark:border-slate-800"
              }`}
            >
              {/* Selo Mais popular (sem corte de overflow) */}
              {isPro && plan.promoBadge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-1 text-xs font-extrabold text-white shadow-xs">
                    <Sparkles className="size-3" />
                    {plan.promoBadge}
                  </span>
                </div>
              )}

              {/* Conteúdo Superior */}
              <div className="flex flex-1 flex-col">
                <div className="border-b border-slate-100 pb-5 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-extrabold text-emerald-950 dark:text-emerald-50">
                      {plan.name}
                    </h3>
                    {isEnterprise && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <Building2 className="size-3 text-slate-500 dark:text-slate-400" />
                        Multi-unidades
                      </span>
                    )}
                  </div>

                  {/* Frase de público-alvo */}
                  <p className="mt-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                    {plan.headline}
                  </p>

                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {plan.description}
                  </p>

                  {/* Preço */}
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl dark:text-emerald-50">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        {plan.period}
                      </span>
                    )}
                  </div>

                  {/* Resumo de Limites */}
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-emerald-800 border border-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
                      {plan.limits.servicesLabel}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {plan.limits.professionalsLabel}
                    </span>
                  </div>
                </div>

                {/* Lista de Recursos */}
                <div className="flex-1 py-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    O que está incluso:
                  </p>

                  <ul className="mt-3 space-y-2.5">
                    {plan.features.map((feature, idx) => {
                      const isAvailable = feature.status === "available"

                      return (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm"
                        >
                          {isAvailable ? (
                            <div className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                              <Check className="size-3" />
                            </div>
                          ) : (
                            <div className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                              <Clock className="size-3" />
                            </div>
                          )}

                          <div className="flex-1">
                            <span
                              className={
                                isAvailable
                                  ? "text-slate-700 dark:text-slate-200"
                                  : "text-slate-400 font-normal dark:text-slate-500"
                              }
                            >
                              {feature.text}
                            </span>

                            {!isAvailable && (
                              <span className="ml-1.5 inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                Em breve
                              </span>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>

              {/* Rodapé com botão alinhado */}
              <div className="pt-2">
                <SubscriptionButton
                  type={plan.id}
                  actionLabel={plan.actionLabel}
                  billingPeriod={billingPeriod}
                />
              </div>
            </div>
          )
        })}
      </section>

      {/* Tabela Comparativa Completa */}
      <section className="space-y-6 pt-6">
        <div className="text-center">
          <h3 className="text-xl font-extrabold text-emerald-950 sm:text-2xl dark:text-emerald-50">
            Comparativo detalhado de recursos
          </h3>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Confira tudo o que já está disponível e o que está chegando na plataforma.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-emerald-950 dark:border-slate-800 dark:bg-slate-800/60 dark:text-emerald-50">
                <th className="p-4 sm:p-5 font-bold">Recurso / Funcionalidade</th>
                <th className="p-4 sm:p-5 font-bold text-center w-36">Básico</th>
                <th className="p-4 sm:p-5 font-bold text-center w-40 bg-emerald-50/60 text-emerald-900 border-x border-emerald-100 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300">
                  Profissional
                </th>
                <th className="p-4 sm:p-5 font-bold text-center w-44">
                  Rede de clínicas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-300">
              {PLAN_FEATURES.map((feat) => {
                const isBasic = feat.plans.includes("BASIC")
                const isPro = feat.plans.includes("PROFESSIONAL")
                const isEnterprise = feat.plans.includes("ENTERPRISE")

                const renderCell = (planKey: PlanId, hasFeature: boolean) => {
                  if (!hasFeature) {
                    return (
                      <span className="inline-flex text-slate-300 dark:text-slate-600">
                        <Minus className="size-4" />
                      </span>
                    )
                  }

                  const customNote = feat.note?.[planKey]

                  if (feat.status === "available") {
                    return (
                      <div className="inline-flex flex-col items-center gap-0.5">
                        <div className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                          <Check className="size-3.5" />
                        </div>
                        {customNote && (
                          <span className="text-[10px] font-medium text-emerald-900 dark:text-emerald-300">
                            {customNote}
                          </span>
                        )}
                      </div>
                    )
                  }

                  // Recurso "soon" (Em breve)
                  return (
                    <div className="inline-flex flex-col items-center gap-0.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <Clock className="size-3 text-slate-400 dark:text-slate-500" />
                        Em breve
                      </span>
                      {customNote && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {customNote}
                        </span>
                      )}
                    </div>
                  )
                }

                return (
                  <tr
                    key={feat.id}
                    className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/40"
                  >
                    <td className="p-4 sm:p-5">
                      <div className="font-semibold text-emerald-950 dark:text-emerald-50">
                        {feat.label}
                      </div>
                      {feat.status === "soon" && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          Previsto em atualizações contínuas
                        </span>
                      )}
                    </td>

                    <td className="p-4 sm:p-5 text-center">
                      {renderCell("BASIC", isBasic)}
                    </td>

                    <td className="p-4 sm:p-5 text-center bg-emerald-50/30 border-x border-emerald-100 dark:border-emerald-500/25 dark:bg-emerald-500/5">
                      {renderCell("PROFESSIONAL", isPro)}
                    </td>

                    <td className="p-4 sm:p-5 text-center">
                      {renderCell("ENTERPRISE", isEnterprise)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
