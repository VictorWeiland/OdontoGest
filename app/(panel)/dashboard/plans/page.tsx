import getSession from '@/lib/getSession'
import { redirect } from 'next/navigation'
import { GridPlans } from './components/grid-plans';
import { getSubscription } from '@/utils/get-subscription';
import { SubscriptionDetail } from './components/subscription-detail';
import { CheckoutRefresh } from './components/checkout-refresh';

export default async function Plans() {

    const session = await getSession();

    if (!session) {
        redirect("/")
    }

    const subscription = await getSubscription({ userId: session.user.id })

    return (
        <div>
            <CheckoutRefresh />
            {subscription?.status !== "active" && (
                <GridPlans />
            )}

            {subscription?.status === "active" && (
                <SubscriptionDetail subscription={subscription!}/>
            )}

        </div>
    )
}