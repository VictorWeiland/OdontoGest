"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { z } from 'zod'

const formSchema = z.object({
    reminderId: z.string({ errorMap: () => ({ message: "O id do lembrete é obrigatorio" }) }).min(1, "O id do lembrete é obrigatorio"),
})

type FormSchema = z.infer<typeof formSchema>

export async function deleteReminder(formData: FormSchema) {
    const session = await auth()
    if (!session?.user?.id) {
        return {
            error: "Usuário não encontrado."
        }
    }

    const schema = formSchema.safeParse(formData)
    if (!schema.success) {
        return {
            error: schema.error.issues[0].message
        }
    }

    try {
        const result = await prisma.reminder.deleteMany({
            where: {
                id: formData.reminderId,
                userId: session.user.id,
            }
        })

        if (result.count === 0) {
            return {
                error: "Lembrete não encontrado."
            }
        }

        revalidatePath("/dashboard")

        return {
            data: "Lembrete deletado com sucesso"
        }
    } catch (err) {
        console.error("Falha ao deletar lembrete:", err)
        return {
            error: "Não foi possivel deletar o lembrete."
        }
    }
}