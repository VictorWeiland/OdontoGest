import prisma from '@/lib/prisma'
import Stripe from 'stripe'
import { stripe } from '@/utils/stripe'
import { Plan } from '@/lib/generated/prisma/enums'

/**
 * Salvar, atualizar ou deletar informações das assinaturas (subscriptions) no banco de dados, sincronizando com a stripe
 * 
 * @async
 * @function manageSubscription
 * @param {string} subscriptionId - O ID da assinatura a ser gerenciada
 * @param {string} customerId - O ID do cliente associado a assinatura
 * @param {boolean} deleteAction - Indica se uma assinatura deve ser deletada
 * @param {Plan} [type] - o plano associado a assinatura
 * @return {Promise<Response|void>}
 */
export async function manageSubscription(
    subscriptionId: string,
    customerId: string,
    deleteAction = false,
    type?: Plan
) {
    //Buscar do banco o usuario com esse customerID
    //Salvar os dados de assinatura feita no banco.

    const findUser = await prisma.user.findFirst({
        where: {
            stripe_custumer_id: customerId
        }
    })

    if (!findUser) {
        throw new Error("Usuário não encontrado para o cliente Stripe")
    }

    if (!stripe) {
        throw new Error("Stripe não está configurado")
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const priceId = subscription.items.data[0].price.id
    const subscriptionData = {
        id: subscription.id,
        userId: findUser.id,
        status: subscription.status,
        PriceId: priceId,
        plan: type ?? (priceId === process.env.STRIPE_PLAN_PROFISSIONAL ? Plan.PROFESSIONAL : Plan.BASIC)
    }

    if (subscriptionId && deleteAction) {
        await prisma.subscription.delete({
            where: {
                id: subscriptionId
            }
        })

        
        return;
    }

    await prisma.subscription.upsert({
        where: {
            userId: findUser.id
        },
        create: subscriptionData,
        update: {
            id: subscriptionData.id,
            status: subscriptionData.status,
            PriceId: subscriptionData.PriceId,
            plan: subscriptionData.plan
        }
    })

}