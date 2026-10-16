"use server"

import prisma from "@/lib/prisma"

export async function getSubscription({ userId }: { userId: string }) {

    if (!userId) {
        return null;
    }

    return prisma.subscription.findFirst({
        where: {
            userId: userId
        }
    })
}