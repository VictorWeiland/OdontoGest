"use client"
import * as React from "react"
import { ProfileFormData, useProfileForm } from './profile-form'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Form,
    FormControl,
    FormDescription,
    FormField, FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

import imgTest from '../../../../../public/foto1.png'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { cn } from "cn"
import { Prisma } from "@/lib/generated/prisma/client"
import { updateProfile } from "../_actions/update-profile"
import {toast} from 'sonner'
import { formatPhone } from '@/utils/formatPhone'
import {  signOut, useSession  } from 'next-auth/react'
import {useRouter} from 'next/navigation'
import { AvatarProfile } from "./profile-avatar"


const status = [ //Status da Clnica
    { label: "ATIVO (clinica aberta) ", value: "active" },
    { label: "INATIVO (clinica fechada) ", value: "inactive" },
]

const timeZones = Intl.supportedValuesOf("timeZone").filter((zone)=>
    zone.startsWith("America/Sao_Paulo") ||
    zone.startsWith("America/Fortaleza") ||
    zone.startsWith("America/Recife") ||
    zone.startsWith("America/Bahia") ||
    zone.startsWith("America/Belem") ||
    zone.startsWith("America/Manaus") ||
    zone.startsWith("America/Cuiaba") ||
    zone.startsWith("America/Boa_Vista")
)

type UserWithSubscription = Prisma.UserGetPayload<{
    include:{
        subscription: true
    }
}>

interface ProfileContentProps{
    user: UserWithSubscription;
}

export function ProfileContent({user}: ProfileContentProps) {

    const router = useRouter();

    const[selectedHours, setSelectedHours] = React.useState<string[]>(user.times ??[])
    const[dialogIsOpen, setDialogIsOpen] = React.useState(false)
    const{update} = useSession();

    const [alignItemWithTrigger, setAlignItemWithTrigger] = React.useState(true)


    const form = useProfileForm({
        name: user.name,
        address: user.address,
        phone: user.phone,
        status: user.status,
        timeZone: user.timeZone,
        times: user.times
    });

    function generateTimeSlots() :string[]{
        const hours: string[] = [];
        for(let i = 8; i <= 24; i++){
            for(let j = 0; j<2; j++){
                const hour = i.toString().padStart(2, "0")
                const minute = (j * 30).toString().padStart(2, "0")
                hours.push(`${hour}:${minute}`)
            }
        }
        return hours;
    }

    const hours = generateTimeSlots();

    function toggleHour(hour: string){
        setSelectedHours((prev) => prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour].sort())
    }

    async function onSubmit(values: ProfileFormData) {

        const response = await updateProfile({
            name: values.name,
            address: values.address,
            status: values.status === 'active' ? true : false,
            phone: values.phone,
            timeZone: values.timeZone,
            times: selectedHours || []
        })
        if(response.error){
            //exiber um alerta
            toast.error(response.error)
            return;
        }
        //exiber um alerta de sucesso
        toast.success(response.data)

    }


    async function handleLogout() {
        await signOut();
        await update();
        router.replace("/")
    }

    return (
        <div className='mx-auto'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Meu Perfil</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-center">
                                <AvatarProfile 
                                    avatarUrl={user.image}
                                    userId={user.id}/>
                            </div>
                            <div className='space-y-4'>
                                <FormField
                                    control={form.control}
                                    name='name'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='font-semibold'>Nome Completo</FormLabel>
                                            <FormControl>
                                                <Input{...field} placeholder='Digite o nome da clinica...' />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='address'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='font-semibold'>Endereço Completo:</FormLabel>
                                            <FormControl>
                                                <Input{...field} placeholder='Digite o endereço da clinica...' />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='phone'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='font-semibold'>Telefone:</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field} 
                                                    placeholder='(DDD) 99999-9999' 
                                                    onChange = { (e) => {
                                                        const formattedValue = formatPhone(e.target.value)
                                                        field.onChange(formattedValue)
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='status'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='font-semibold'>
                                                Status da Clinica:
                                            </FormLabel>
                                            <FormControl>

                                                <Select
                                                    items={status}
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Selecione o status da clinica" />
                                                    </SelectTrigger>
                                                    <SelectContent alignItemWithTrigger={alignItemWithTrigger}>
                                                        <SelectGroup>
                                                            {status.map((item) => (
                                                                <SelectItem key={item.value} value={item.value}>
                                                                    {item.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div className="space-y-2">
                                    <Label className='font-semibold'>
                                        Configurar Horário da Clínica
                                    </Label>
                                    <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
                                        <DialogTrigger
                                            render={
                                                <Button variant='outline' className='w-full justify-between' />
                                            }
                                        >
                                            Clique aqui para selecionar horários
                                            <ArrowRight className='w-5 h-5' />
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Horários da Clinica</DialogTitle>
                                                <DialogDescription>Selecione abaixo os horaios de funcionamento da clínica:</DialogDescription>
                                            </DialogHeader>
                                            <section className="py-4">
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    Clique nos horarios abaixo para marcar ou desmarcar:
                                                </p>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {hours.map((hour)=> (
                                                        <Button 
                                                            key={hour} 
                                                            variant="outline" 
                                                            className={cn("h-10", selectedHours.includes(hour)&& "border-3 border-emerald-500 text-primary")} onClick={()=> toggleHour(hour)}
                                                        >
                                                            {hour}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </section>
                                            <Button 
                                                className="w-full" 
                                                onClick={() => setDialogIsOpen(false)}
                                            >
                                                Salvar Horarios
                                            </Button>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                 <FormField
                                    control={form.control}
                                    name='timeZone'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='font-semibold'>
                                                Selecione o Fuso horário:
                                            </FormLabel>
                                            <FormControl>

                                                <Select
                                                    onValueChange={field.onChange} defaultValue={field.value} 
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Selecione o seu Fuso horário" />
                                                    </SelectTrigger>
                                                    <SelectContent alignItemWithTrigger={alignItemWithTrigger}>
                                                    
                                                            {timeZones.map((zone) => (
                                                                <SelectItem key={zone} value={zone}>
                                                                    {zone}
                                                                </SelectItem>
                                                            ))}
                                                        
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400">
                                    Salvar alterações
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>

            </Form>

            <section className="mt-4">
                <Button
                    variant="destructive"
                    onClick={handleLogout}
                >
                    Sair da Conta
                </Button>
            </section>
        </div>
    )
}