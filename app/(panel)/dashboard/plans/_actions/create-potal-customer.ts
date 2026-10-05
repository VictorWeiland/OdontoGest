"use server"

import { auth } from "@/lib/auth"
import prisma from '@/lib/prisma'
import { stripe } from "@/utils/stripe"

export async function createPortalCustomer() {
    const session = await auth();

    if (!session?.user?.id) {
        return {
            url: "",
            error: "Usuário não encontrado"
        }
    }

    if (!stripe) {
        return {
            url: "",
            error: "Stripe não está configurado"
        }
    }

    try {
        const [user, subscription] = await Promise.all([
            prisma.user.findUnique({
                where: { id: session.user.id },
                select: { stripe_custumer_id: true },
            }),
            prisma.subscription.findUnique({
                where: { userId: session.user.id },
                select: { id: true, status: true },
            }),
        ])

        if (!user?.stripe_custumer_id || !subscription || subscription.status !== "active") {
            return {
                url: "",
                error: "Não foi encontrada uma assinatura ativa para cancelar."
            }
        }

        const returnUrlValue = process.env.STRIPE_SUCCESS_URL
        if (!returnUrlValue) {
            return {
                url: "",
                error: "A URL de retorno do Stripe não está configurada."
            }
        }

        const returnUrl = new URL(returnUrlValue)
        returnUrl.pathname = "/dashboard/plans"
        returnUrl.search = ""
        returnUrl.hash = ""

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripe_custumer_id,
            return_url: returnUrl.toString(),
            flow_data: {
                type: "subscription_cancel",
                subscription_cancel: {
                    subscription: subscription.id,
                },
                after_completion: {
                    type: "redirect",
                    redirect: {
                        return_url: returnUrl.toString(),
                    },
                },
            },
        })
        return {
            url: portalSession.url
        }
    } catch (err) {
        console.error("ERRO AO CRIAR FLUXO DE CANCELAMENTO: ", err)
        return {
            url: "",
            error: "Não foi possível iniciar o cancelamento da assinatura. Tente novamente."
        }
    }
}