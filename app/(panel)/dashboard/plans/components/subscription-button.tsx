"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlanId } from "@/utils/plans"
import { createSubscription } from "../_actions/create-subscription"
import { toast } from "sonner"
import { Plan } from "@/lib/generated/prisma/client"
import { MessageCircle, Mail, ArrowRight, Loader2 } from "lucide-react"

interface SubscriptionButtonProps {
  type: PlanId
  actionLabel?: string
  billingPeriod?: "monthly" | "yearly"
}

export function SubscriptionButton({
  type,
  actionLabel,
  billingPeriod = "monthly",
}: SubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Tratamento específico para o plano Rede de Clínicas (ENTERPRISE)
  if (type === "ENTERPRISE") {
    const rawPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""
    const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || ""
    const enterpriseMessage =
      "Olá! Tenho uma rede de clínicas e gostaria de conhecer o OdontoGEST"

    if (rawPhone) {
      const cleanPhone = rawPhone.replace(/\D/g, "")
      const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`
      const whatsappUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(
        enterpriseMessage
      )}`

      return (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 bg-white px-4 py-3 text-sm font-bold text-emerald-800 shadow-2xs transition-all duration-150 hover:bg-emerald-50 hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-emerald-600"
        >
          <MessageCircle className="size-4 text-emerald-600" />
          <span>{actionLabel || "Falar com a equipe"}</span>
          <ArrowRight className="size-4" />
        </a>
      )
    }

    if (contactEmail) {
      const mailtoUrl = `mailto:${contactEmail}?subject=${encodeURIComponent(
        "Interesse no Plano Rede de Clínicas - OdontoGEST"
      )}&body=${encodeURIComponent(enterpriseMessage)}`

      return (
        <a
          href={mailtoUrl}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 bg-white px-4 py-3 text-sm font-bold text-emerald-800 shadow-2xs transition-all duration-150 hover:bg-emerald-50 hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-emerald-600"
        >
          <Mail className="size-4 text-emerald-600" />
          <span>{actionLabel || "Falar com a equipe"}</span>
          <ArrowRight className="size-4" />
        </a>
      )
    }

    // Se nenhum contato estiver configurado, oculta o botão
    return null
  }

  // Planos com checkout Stripe (BASIC e PROFESSIONAL)
  async function handleCreateBilling() {
    if (isLoading) return

    setIsLoading(true)
    try {
      const { error, url } = await createSubscription({
        type: type as Plan,
        billingPeriod,
      })

      if (error) {
        toast.error(error)
        return
      }

      if (url) {
        window.location.href = url
      } else {
        toast.error("Não foi possível iniciar o checkout.")
      }
    } catch (err) {
      console.error("ERRO AO INICIAR CHECKOUT", err)
      toast.error("Não foi possível iniciar o checkout. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const isPro = type === "PROFESSIONAL"

  return (
    <Button
      onClick={handleCreateBilling}
      disabled={isLoading}
      className={`w-full rounded-xl py-3 text-sm font-bold shadow-xs transition-all duration-150 ${
        isPro
          ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
          : "border border-slate-200 bg-slate-900 text-white hover:bg-slate-800"
      }`}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          Abrindo checkout...
        </span>
      ) : (
        <span>{actionLabel || (isPro ? "Ativar Assinatura" : "Começar Agora")}</span>
      )}
    </Button>
  )
}
