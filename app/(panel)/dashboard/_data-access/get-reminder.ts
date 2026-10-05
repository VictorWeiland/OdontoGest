"use server"

import prisma from '@/lib/prisma'

export async function getReminders({ userId }: { userId: string }) {

    if (!userId) {
        return []
    }

    try {
        const reminders = await prisma.reminder.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return reminders;

    } catch (err) {
        console.error(err);
        return []
    }
}