"use server"

import prisma from "@/lib/prisma"
import type { Prisma } from "@/lib/generated/prisma/client"

type PublicClinic = Prisma.UserGetPayload<{
    select: {
        id: true
        name: true
        image: true
        address: true
        subscription: {
            select: {
                status: true
                plan: true
            }
        }
    }
}>

export async function getProfessionals(): Promise<PublicClinic[]> {
    return prisma.user.findMany({
            where:{
                status: true,
            },
            select: {
                id: true,
                name: true,
                image: true,
                address: true,
                subscription: {
                    select: {
                        status: true,
                        plan: true,
                    },
                },
            }
    })
}