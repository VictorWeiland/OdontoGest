"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plan } from '@/lib/generated/prisma/client'
import { createSubscription } from '../_actions/create-subscription'
import { toast } from 'sonner'

interface SubscriptionButtonProps {
    type: Plan
}

export function SubscriptionButton({ type }: SubscriptionButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    async function handleCreateBilling() {
        if (isLoading) return

        setIsLoading(true)
        try {
            const { error, url } = await createSubscription({ type })

            if (error) {
                toast.error(error)
                return
            }

            if (url) {
                window.location.href = url
            } else {
                toast.error("Não foi possível iniciar o checkout.")
            }
        } catch (err) {
            console.error("ERRO AO INICIAR CHECKOUT", err)
            toast.error("Não foi possível iniciar o checkout. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            className={`w-full ${type === "PROFESSIONAL" && "bg-emerald-500 hover:bg-emerald-400"}`}
            onClick={handleCreateBilling}
            disabled={isLoading}
        >
            {isLoading ? "Abrindo checkout..." : "Ativar Assinatura"}
        </Button>
    )
}