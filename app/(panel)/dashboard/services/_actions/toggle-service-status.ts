"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleServiceStatus({
  serviceId,
  status,
}: {
  serviceId: string
  status: boolean
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Acesso não autorizado!",
    }
  }

  try {
    const updated = await prisma.service.update({
      where: {
        id: serviceId,
        userId: session.user.id,
      },
      data: {
        status,
      },
    })

    revalidatePath("/dashboard/services")
    return {
      data: `Serviço ${updated.status ? "ativado" : "desativado"} com sucesso.`,
    }
  } catch (error) {
    console.error("Erro ao alternar status do serviço:", error)
    return {
      error: "Falha ao alterar o status do serviço.",
    }
  }
}
