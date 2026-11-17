import getSession from "@/lib/getSession"
import { redirect } from "next/navigation"
import { GridPlans } from "./components/grid-plans"
import { getSubscription } from "@/utils/get-subscription"
import { SubscriptionDetail } from "./components/subscription-detail"
import { CheckoutRefresh } from "./components/checkout-refresh"

export default async function Plans() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  const subscription = await getSubscription({ userId: session.user.id })
  const hasActiveSubscription =
    subscription?.status === "active" || subscription?.status === "trialing"

  return (
    <div className="space-y-6">
      <CheckoutRefresh />
      {!hasActiveSubscription ? (
        <GridPlans />
      ) : (
        <SubscriptionDetail subscription={subscription} />
      )}
    </div>
  )
}
