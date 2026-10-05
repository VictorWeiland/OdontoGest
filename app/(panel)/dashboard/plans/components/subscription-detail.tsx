'use client'

import { useState } from 'react'
import type { Subscription } from "@/lib/generated/prisma/client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card'
import { subscriptionPlans } from "@/utils/plans/index"
import { Button } from "@/components/ui/button";
import { createPortalCustomer } from "../_actions/create-potal-customer";
import { toast } from "sonner";

interface SubscriptionDetailProps {
    subscription: Subscription;
}

export function SubscriptionDetail({ subscription }: SubscriptionDetailProps) {
    const [isLoading, setIsLoading] = useState(false)

    const subscriptionInfo = subscriptionPlans.find(plan => plan.id === subscription.plan)

    async function handleCancelSubscription() {
        if (isLoading) return

        setIsLoading(true)
        try {
            const portal = await createPortalCustomer()
            if (portal.error) {
                toast.error(portal.error)
                return
            }

            if (portal.url) {
                window.location.href = portal.url
            } else {
                toast.error("Não foi possível iniciar o cancelamento da assinatura.")
            }
        } catch (err) {
            console.error("ERRO AO INICIAR CANCELAMENTO DA ASSINATURA", err)
            toast.error("Não foi possível iniciar o cancelamento da assinatura. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Seu Plano Atual</CardTitle>
                <CardDescription>
                    Sua Assinatura está ativa!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg md:text-xl">
                        {subscription.plan === "BASIC" ? "BASIC" : "PROFISSIONAL"}
                    </h3>
                    <div className="bg-green-500 text-white w-fit px-4 py-1 rounded-md">
                        {subscription.status === "active" ? "ATIVO" : "INATIVO"}
                    </div>
                </div>

                <ul className="list-disc list-inside space-y-2">
                    {subscriptionInfo && subscriptionInfo.features.map(feature => (
                        <li key={feature}>{feature}</li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter>
                <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                >
                    {isLoading ? "Abrindo cancelamento..." : "Cancelar assinatura"}
                </Button>
            </CardFooter>
        </Card>
    )
}