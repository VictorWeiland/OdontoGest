import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/utils/stripe'
import { manageSubscription } from '@/utils/manage-subscription'
import { Plan } from '@/lib/generated/prisma/enums'
import { revalidatePath } from 'next/cache'



export const POST = async (request: Request) => {
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
        return NextResponse.error()
    }



    const text = await request.text()

    if (!stripe) {
        return NextResponse.json(
            { error: "Stripe não está configurado" },
            { status: 500 }
        )
    }

    const event = stripe.webhooks.constructEvent(
        text,
        signature,
        process.env.STRIPE_SECRET_WEBHOOK_KEY as string
    )

    switch (event?.type) {
        case 'customer.subscription.deleted': {
            const payment = event.data.object as Stripe.Subscription
            await manageSubscription(
                payment.id,
                payment.customer.toString(),
                true
            )
            break
        }
        case 'customer.subscription.updated': {
            const paymentIntent = event.data.object as Stripe.Subscription
            await  manageSubscription(
                paymentIntent.id,
                paymentIntent.customer.toString(),
            )
            revalidatePath("/dashboard/plans")
            break
        }
        case 'checkout.session.completed': {
            const checkoutSession = event.data.object as Stripe.Checkout.Session
            const type = checkoutSession?.metadata?.type ? checkoutSession?.metadata?.type : "BASIC"

            if (!checkoutSession.subscription || !checkoutSession.customer) {
                throw new Error("Checkout concluído sem customer ou subscription")
            }

            await manageSubscription(
                checkoutSession.subscription.toString(),
                checkoutSession.customer.toString(),
                false,
                type as Plan
            )
            revalidatePath("/dashboard/plans")
            break
        }
    }

    return NextResponse.json({ received: true })
}