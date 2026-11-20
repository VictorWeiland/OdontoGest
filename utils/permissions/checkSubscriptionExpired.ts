"use server"

import { Session } from "next-auth"
import { addDays, isAfter } from "date-fns"
import prisma from "@/lib/prisma"
import { ResultPermissionProps } from "./canPermission"
import { TRIAL_DAYS, TRIAL_MAX_SERVICES } from "./trial-limits"

export async function checkSubscriptionExpired(
  session: Session
): Promise<ResultPermissionProps> {
  let createdAt: Date | string | undefined = session.user?.createdAt

  // Sessões JWT não carregam createdAt por padrão; busca no banco como fallback seguro
  if (!createdAt && session.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { createdAt: true },
    })
    createdAt = user?.createdAt
  }

  const createdAtDate = createdAt ? new Date(createdAt) : null

  if (!createdAtDate || Number.isNaN(createdAtDate.getTime())) {
    return {
      hasPermission: false,
      planId: "EXPIRED",
      expired: true,
      plan: null,
    }
  }

  const trialEndDate = addDays(createdAtDate, TRIAL_DAYS)

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
    plan: {
      maxServices: TRIAL_MAX_SERVICES,
      maxProfessionals: 1,
    },
  }
}
