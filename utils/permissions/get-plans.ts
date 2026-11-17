"use server"

import { Plan } from "@/lib/generated/prisma/client"
import { PLANS, PlansDetailsProps } from "@/utils/plans"

export type PlanDetailInfo = PlansDetailsProps

export async function getPlan(planId: Plan): Promise<PlanDetailInfo> {
    return PLANS[planId] || { maxServices: 15, maxProfessionals: 1 }
}
