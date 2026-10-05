"use server"

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { stripe } from '@/utils/stripe'
import { Plan } from '@/lib/generated/prisma/enums'

interface SubscriptionProps {
    type: Plan;
}

export async function createSubscription({ type }: SubscriptionProps) {
    if (!stripe) {
        return {
            sessionId: "",
            error: "Stripe não está configurado. Verifique as variáveis de ambiente."
        }
    }

    if (type !== Plan.BASIC && type !== Plan.PROFESSIONAL) {
        return {
            sessionId: "",
            error: "Plano inválido."
        }
    }

    const priceId = type === Plan.BASIC
        ? process.env.STRIPE_PLAN_BASIC
        : process.env.STRIPE_PLAN_PROFISSIONAL
    const successUrlValue = process.env.STRIPE_SUCCESS_URL
    const cancelUrl = process.env.STRIPE_CANCEL_URL

    if (!priceId || !successUrlValue || !cancelUrl) {
        return {
            sessionId: "",
            error: "Configuração do checkout incompleta. Verifique os preços e as URLs do Stripe na Vercel."
        }
    }

    try {
        const successUrl = new URL(successUrlValue)
        const validatedCancelUrl = new URL(cancelUrl)

        if (!["http:", "https:"].includes(successUrl.protocol)
            || !["http:", "https:"].includes(validatedCancelUrl.protocol)) {
            throw new Error("As URLs de sucesso e cancelamento do Stripe devem usar HTTP ou HTTPS.")
        }

        successUrl.searchParams.set("checkout", "success")

        const session = await auth()
        const userId = session?.user?.id

        if (!userId) {
            return {
                sessionId: "",
                error: "Falha ao ativar plano. Entre novamente na sua conta."
            }
        }

        const findUser = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!findUser) {
            return {
                sessionId: "",
                error: "Não foi possível encontrar sua conta."
            }
        }

        let customerId = findUser.stripe_custumer_id

        if (!customerId) {
            const stripeCustomer = await stripe.customers.create({
                email: findUser.email
            })
            await prisma.user.update({
                where: { id: userId },
                data: { stripe_custumer_id: stripeCustomer.id }
            })

            customerId = stripeCustomer.id
        }

        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ["card"],
            billing_address_collection: "required",
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                }
            ],
            metadata: {
                type: type
            },
            mode: "subscription",
            allow_promotion_codes: true,
            success_url: successUrl.toString(),
            cancel_url: validatedCancelUrl.toString(),
        })

        return {
            sessionId: stripeCheckoutSession.id,
            url: stripeCheckoutSession.url
        }

    } catch (err) {
        console.error("ERRO AO CRIAR ASSINATURA NO STRIPE", err)
        return {
            sessionId: "",
            error: "Não foi possível abrir o checkout. Confira as configurações do Stripe na Vercel ou tente novamente."
        }
    }
}