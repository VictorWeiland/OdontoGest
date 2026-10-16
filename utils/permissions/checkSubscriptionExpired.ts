"use server"

import { Session } from "next-auth"
import { addDays, isAfter } from "date-fns"
import { ResultPermissionProps } from "./canPermission";
import {TRIAL_DAYS} from "./trial-limits"

export async function checkSubscriptionExpired(session: Session): Promise<ResultPermissionProps> {
    const createdAt = session.user?.createdAt;
    const createdAtDate = createdAt ? new Date(createdAt) : null;

    if (!createdAtDate || Number.isNaN(createdAtDate.getTime())) {
        return {
            hasPermission: false,
            planId: "EXPIRED",
            expired: true,
            plan: null,
        }
    }

    const trialEndDate = addDays(createdAtDate, TRIAL_DAYS);

    if (isAfter(new Date(), trialEndDate)) {
        return {
            hasPermission: false,
            planId: "EXPIRED",
            expired: true,
            plan: null,
        }
    }

    return {
        hasPermission: true,
        planId: "TRIAL",
        expired: false,
        plan: null,
    }
}