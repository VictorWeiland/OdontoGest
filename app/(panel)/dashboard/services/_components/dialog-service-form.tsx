"use client"

import {  zodResolver  } from '@hookform/resolvers/zod'
import {  z  } from 'zod'
import {  useForm  } from 'react-hook-form'

const formSchema = z.object({
    name: z.string().min(1, {message: "o nome do serviço é obrigatorio"}),
    price: z.string().min(1, {message: "o preço do serviço é obrigatorio"}),
    hours: z.string(),
    minutes: z.string(),

})

export interface useDialogServiceFormProps{
    initialValues?:{
        name: string;
        price: string;
        hours: string;
        minutes: string;
    }
}

export type DialogServiceFormData = z.infer<typeof formSchema>;

export function useDialogServiceForm({initialValues}: useDialogServiceFormProps){
    return useForm<DialogServiceFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: initialValues || {
            name: "",
            price: "",
            hours: "",
            minutes: "",            
        }
    })
}