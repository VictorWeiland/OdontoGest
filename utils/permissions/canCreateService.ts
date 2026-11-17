"use server"

import { Subscription } from '@/lib/generated/prisma/client'
import prisma from '@/lib/prisma'
import { Session } from 'next-auth'
import { getPlan } from './get-plans'
import { PLANS } from '../plans'
import { checkSubscriptionExpired } from './checkSubscriptionExpired'
import { ResultPermissionProps } from './canPermission'
import { TRIAL_MAX_SERVICES } from './trial-limits'

export async function canCreateService(subscription: Subscription | null, session: Session): Promise<ResultPermissionProps> {
    try {
        const serviceCount = await prisma.service.count({
            where: {
                userId: session.user?.id,
                status: true,
            }
        })

        const isSubscribed = Boolean(
            subscription && (subscription.status === "active" || subscription.status === "trialing")
        )

        if (subscription && isSubscribed) {
            const plan = subscription.plan;
            const planLimits = await getPlan(plan);
            const isUnlimited = planLimits.maxServices === null || planLimits.maxServices === undefined;
            const hasPermission = isUnlimited || serviceCount < (planLimits.maxServices ?? 0);

            return {
                hasPermission,
                planId: subscription.plan,
                expired: false,
                plan: PLANS[subscription.plan],
            }
        }

        const checkTestLimit = await checkSubscriptionExpired(session);

        return {
            ...checkTestLimit,
            hasPermission: checkTestLimit.hasPermission && serviceCount < TRIAL_MAX_SERVICES,
        };

    } catch (err) {
        console.error("Falha ao verificar permissão de serviço:", err)
        return {
            hasPermission: false,
            planId: "EXPIRED",
            expired: true,
            plan: null,
        }
    }
}
