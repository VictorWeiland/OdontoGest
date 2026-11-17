import prisma from "@/lib/prisma"

export async function getPermissionUserToReports({ userId }: { userId: string }) {
    const subscription = await prisma.subscription.findUnique({
        where: {
            userId,
        },
        select: {
            plan: true,
            status: true,
        },
    })

    const isSubscribed = subscription?.status === "active" || subscription?.status === "trialing"
    return subscription?.plan === "PROFESSIONAL" && isSubscribed
}
