"use server"

import prisma from "@/lib/prisma"
import type { Prisma } from "@/lib/generated/prisma/client"
import { SHOW_DEMO_CLINICS } from "@/lib/landing-config"

export type PublicClinic = Prisma.UserGetPayload<{
    select: {
        id: true
        name: true
        image: true
        address: true
        isDemo: true
        specialties: true
        subscription: {
            select: {
                status: true
                plan: true
            }
        }
    }
}>

export interface ProfessionalsResult {
    clinics: PublicClinic[]
    /** true quando só existem clínicas de demonstração (selo "Exemplo") */
    demoOnly: boolean
}

/**
 * Regra: se houver clínicas reais, retorna só elas.
 * Se só houver demo, retorna as demo apenas quando SHOW_DEMO_CLINICS estiver ligada.
 */
export async function getProfessionals(): Promise<ProfessionalsResult> {
    const all = await prisma.user.findMany({
        where: { status: true },
        select: {
            id: true,
            name: true,
            image: true,
            address: true,
            isDemo: true,
            specialties: true,
            subscription: {
                select: {
                    status: true,
                    plan: true,
                },
            },
        },
    })

    const real = all.filter((c) => !c.isDemo)
    if (real.length > 0) return { clinics: real, demoOnly: false }

    const demo = all.filter((c) => c.isDemo)
    if (SHOW_DEMO_CLINICS && demo.length > 0) return { clinics: demo, demoOnly: true }

    return { clinics: [], demoOnly: false }
}
