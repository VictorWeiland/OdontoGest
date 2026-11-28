"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {  useForm  } from 'react-hook-form'
import { z } from 'zod'

interface UseProfileFormProps{
    name: string | null;
    address: string | null;
    phone: string | null;
    status: boolean | null;
    timeZone: string | null;
    times: string[] | null;
    workingDays: number[] | null;
}

const profileSchema = z.object({
    name: z.string().min(1, {message: "O nome é obrigatorio"}),
    address: z.string().optional(),
    phone: z.string().optional(),
    status: z.string(),
    timeZone: z.string().min(1,{message: "O Time zone é obrigatorio"}),
    times: z.array(z.string()),
    workingDays: z.array(z.number().int().min(0).max(6))
})

export type ProfileFormData = z.infer<typeof profileSchema>;

export function useProfileForm({name, address, phone, status, timeZone, times, workingDays}: UseProfileFormProps){
    return useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues:{
            name: name || "",
            address: address || "",
            phone: phone || "",
            status: status ? "active" : "inactive",
            timeZone: timeZone || "",            
            times: times || [],
            workingDays: workingDays ?? [1, 2, 3, 4, 5],
        }
    })
}