"use server"

import { Plan } from "@/lib/generated/prisma/client"
import { PLANS } from "@/utils/plans"

export interface PlanDetailInfo{
    maxServices: number;
}

export async function getPlan(planId: Plan) {
    return PLANS[planId]
}