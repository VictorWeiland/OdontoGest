"use server"

import {auth} from "@/lib/auth"
import prisma from "@/lib/prisma"
import {z} from 'zod'
import {  revalidatePath  } from 'next/cache'

const formSchema = z.object({
    name: z.string().min(1, {message: "O nome é obrigatorio"}),
    address: z.string().optional(),
    phone: z.string().optional(),
    status: z.boolean(),
    timeZone: z.string(),
    times: z.array(z.string()),
    workingDays: z.array(z.number().int().min(0).max(6)),
})

type FormSchema = z.infer<typeof formSchema>

export async function updateProfile(formData: FormSchema){
    const session = await auth();

    if(!session?.user?.id){
        return{
            error: "Usuário não encontrado"
        }
    }

    const schema = formSchema.safeParse(formData)
    if(!schema.success){
        return{
            error:"preencha todos os campos"
        }
    }

    const normalizedWorkingDays = Array.from(
        new Set(schema.data.workingDays)
    ).sort((a, b) => a - b)

    try{
        await prisma.user.update({
            where:{
                id: session?.user?.id
            },
            data:{
                name: formData.name,
                address: formData.address,
                phone: formData.phone,
                status: formData.status,
                timeZone: formData.timeZone,
                times: formData.times || [],
                workingDays: normalizedWorkingDays,
            }
        })

        revalidatePath("/dashboard/profile")
        revalidatePath("/dashboard")
        revalidatePath("/")
        revalidatePath(`/clinica/${session.user.id}`)

        return{
            data: "Clinica Atualizada Com Sucesso",
        }
    }catch(err){
        console.error("Falha ao atualizar perfil:", err)
        return{
            error:"Falha ao atualizar clínica"
        }
    }
}