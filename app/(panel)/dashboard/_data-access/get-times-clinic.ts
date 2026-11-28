"use server"

import prisma from "@/lib/prisma"

export async function getTimesClinic({ userId }: { userId: string }) {
    if(!userId){
        return{
            times:[],
            userId: "",
            status: false,
            workingDays: [] as number[],
        }
    }

    try {
        const user = await prisma.user.findFirst({
            where:{
                id: userId
            },
            select:{
                id: true,
                times: true,
                status: true,
                workingDays: true,
            }
        })
        if(!user){
            return{
                times: [],
                userId: "",
                status: false,
                workingDays: [] as number[],
            }
        }
        return{
            times: user.times,
            userId: user.id,
            status: user.status,
            workingDays: user.workingDays,
        }
    } catch (err) {
        console.error(err);
        return{
            times:[],
            userId: "",
            status: false,
            workingDays: [] as number[],
        }
    }
}
