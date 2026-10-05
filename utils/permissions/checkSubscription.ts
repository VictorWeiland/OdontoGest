"use server"

import prisma from "@/lib/prisma";
import { addDays, isAfter, differenceInDays } from "date-fns"
import { TRIAL_DAYS } from "@/utils/permissions/trial-limits"

export async function checkSubscription(userId: string){
    const user = await prisma.user.findFirst({
        where:{
            id: userId,
        },
        include:{
            subscription: true,
        }
    })

    if(!user){
        throw new Error("Usuário não encontrado")
    }

    if(user.subscription && user.subscription.status === "active"){
        return{
            subscriptionStatus: "active",
            message: "Assinatura ativa.",
            planId: user.subscription.plan,
        }
    }

    const trialEndDate = addDays(user.createdAt, TRIAL_DAYS)

    if(isAfter(new Date(), trialEndDate)){
        return{
            subscriptionStatus: "EXPIRED",
            message: "Seu período de teste expirou. Por favor, atualize seu plano para continuar usando nossos serviços.",
            planId: "TRIAL",
        }
    }

    const daysRemaining = differenceInDays(trialEndDate,new Date())
    return{
            subscriptionStatus: "TRIAL",
            message: `Você está no período de teste gratuito! Faltam ${daysRemaining} dias para o termino do período de teste.`,
            planId: "TRIAL",
        }
}