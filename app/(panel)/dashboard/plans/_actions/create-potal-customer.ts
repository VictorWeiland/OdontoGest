"use server"

import { auth } from "@/lib/auth"
import prisma from '@/lib/prisma'
import { stripe } from "@/utils/stripe"

export async function createPortalCustomer() {
    const session = await auth();

    if (!session?.user?.id) {
        return {
            sessionId: "",
            error: "Usuário não encontrado"
        }
    }
    const user = await prisma.user.findFirst({
        where: {
            id: session?.user?.id
        }
    })

    if (!user) {
        return {
            sessionId: "",
            error: "Usuário não encontrado"
        }
    }
    const sessionId = user.stripe_custumer_id;

    if (!sessionId) {
        return {
            sessionId: "",
            error: "Usuário não encontrado"
        }
    }

    if (!stripe) {
        return {
            sessionId: "",
            error: "Stripe não está configurado"
        }
    }

    try {
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: sessionId,
            return_url: process.env.STRIPE_SUCCESS_URL as string
        })
        return {
            sessionId: portalSession.url
        }
    } catch (err) {
        console.error("ERRO AO CRIAR PORTAL: ", err)
        return {
            sessionId: "",
            error: "Usuário não encontrado"
        }
    }
}