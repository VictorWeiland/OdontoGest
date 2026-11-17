"use server"

import prisma from "@/lib/prisma"
import type { Prisma } from "@/lib/generated/prisma/client"

export type PublicClinicSchedule = Prisma.UserGetPayload<{
  select: {
    id: true
    name: true
    address: true
    phone: true
    image: true
    status: true
    times: true
    services: {
      select: {
        id: true
        name: true
        duration: true
        price: true
      }
    }
  }
}>

export async function getInfoSchedule({
  userId,
}: {
  userId: string
}): Promise<PublicClinicSchedule | null> {
  if (!userId) {
    return null
  }

  return prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      image: true,
      status: true,
      times: true,
      services: {
        where: {
          status: true,
        },
        select: {
          id: true,
          name: true,
          duration: true,
          price: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
  })
}
