"use client"

import { Button } from '@/components/ui/button'
import { Plan } from '@/lib/generated/prisma/client'
import { createSubscription } from '../_actions/create-subscription'
import { toast } from 'sonner'

interface SubscriptionButtonProps {
    type: Plan
}


export function SubscriptionButton({ type }: SubscriptionButtonProps) {

    async function handleCreateBilling() {
        const { error, url } = await createSubscription({ type })

        if(error){
            toast.error(error)
            return;
        }

        if (url) {
            window.location.href = url
        } else {
            toast.error("Não foi possível iniciar o checkout.")
        }
    }

    return (
        <Button
            className={`w-full ${type === "PROFESSIONAL" && "bg-emerald-500 hover:bg-emerald-400"}`}
            onClick={handleCreateBilling}
        >
            Ativar Assinatura
        </Button>
    )
}