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

    return subscription?.plan === "PROFESSIONAL" && subscription.status === "active"
}
