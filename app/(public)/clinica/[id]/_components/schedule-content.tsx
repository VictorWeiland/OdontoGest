"use client"

import { useState, useEffect } from 'react'
import Image from "next/image"
import imgTest from '../../../../../public/foto1.png'
import { MapPin } from "lucide-react"
import { Prisma } from "@/lib/generated/prisma/client"
import { useAppointmentForm, AppointmentFormData } from './schedule-form'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatPhone } from '@/utils/formatPhone'
import { DateTimePicker } from "./date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { ScheduleTimeList } from './schedule-times-list'
import { createNewAppointment } from '../_actions/create-appointment'
import { toast } from 'sonner'


type PublicClinicSchedule = Prisma.UserGetPayload<{
    select: {
        id: true
        name: true
        address: true
        image: true
        status: true
        times: true
        services: {
            select: {
                id: true
                name: true
                duration: true
            }
        }
    }
}>

interface ScheduleContentProps {
    clinic: PublicClinicSchedule
}

export interface TimeSlot {
    time: string;
    available: boolean;
}

export function ScheduleContent({ clinic }: ScheduleContentProps) {

    const form = useAppointmentForm();
    const { watch } = form;

    const selectedDate = watch("date")
    const selectedServiceId = watch("serviceId")

    const [selectedTime, setSelectedTime] = useState("");
    const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [blockedTimes, setBlockedTimes] = useState<string[]>([])

    useEffect(() => {
        if (!selectedDate) {
            return
        }

        let isCurrentRequest = true

        async function loadAvailableSlots() {
            setLoadingSlots(true)
            try {
                const dateString = selectedDate.toISOString().split("T")[0]
                const params = new URLSearchParams({
                    userId: clinic.id,
                    date: dateString,
                })
                const response = await fetch(`/api/schedule/get-appointments?${params}`)
                if (!response.ok) {
                    throw new Error(`Falha ao consultar horários (${response.status})`)
                }

                const result: unknown = await response.json()
                if (!Array.isArray(result) || !result.every((time) => typeof time === "string")) {
                    throw new Error("A resposta de horários bloqueados é inválida")
                }

                if (!isCurrentRequest) {
                    return
                }

                const blocked = result as string[]
                setBlockedTimes(blocked)

                const finalSlots = clinic.times.map((time) => ({
                    time: time,
                    available: !blocked.includes(time)
                }))

                setAvailableTimeSlots(finalSlots)
                setSelectedTime((currentTime) =>
                    finalSlots.some((slot) => slot.time === currentTime && slot.available)
                        ? currentTime
                        : ""
                )
            } catch (error) {
                if (!isCurrentRequest) {
                    return
                }
                console.error("Falha ao carregar horários da clínica:", error)
                toast.error("Não foi possível carregar os horários. Tente novamente.")
                setBlockedTimes([])
                setAvailableTimeSlots([])
                setSelectedTime("")
            } finally {
                if (isCurrentRequest) {
                    setLoadingSlots(false)
                }
            }
        }

        void loadAvailableSlots()

        return () => {
            isCurrentRequest = false
        }
    }, [selectedDate, clinic.id, clinic.times])

    async function handleRegisterAppointment(formData: AppointmentFormData) {
        if (!selectedTime) {
            return;
        }

        const response = await createNewAppointment({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            time: selectedTime,
            date: formData.date,
            serviceId: formData.serviceId,
            clinicId: clinic.id,
        })
        if (response.error) {
            toast.error(response.error)
            return;
        }
        toast.success("Consulta agendada com sucesso!")
        form.reset();
        setSelectedTime("")
    }

    return (
        <div className="min-h-screen flex flex-col">
            <div className="h-32 bg-emerald-500" />

            <section className="container mx-auto px-4 -mt-16">
                <div className="max-w-2xl mx-auto">
                    <article className="flex flex-col items-center">
                        <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white mb-8">
                            <Image
                                src={clinic.image ? clinic.image : imgTest}
                                alt="Foto da clinica"
                                className="object-cover"
                                fill
                            />
                        </div>

                        <h1 className="text-2xl font-bold mb-2">
                            {clinic.name}
                        </h1>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-5 h-5" />
                            <span>
                                {clinic.address ? clinic.address : "Endereço não informado"}
                            </span>
                        </div>
                    </article>
                </div>
            </section>

            <section className="max-w-2xl mx-auto w-full">
                {/*formulario agendamento*/}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleRegisterAppointment)}
                        className="space-y-6 bg-white p-6 border rounded-md shadow-sm"
                    >

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="my-1">
                                    <FormLabel className="font-semibold">Nome Completo:</FormLabel>
                                    <FormControl>
                                        <Input
                                            id="name"
                                            placeholder="Digite seu nome completo..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="my-1">
                                    <FormLabel className="font-semibold">Email:</FormLabel>
                                    <FormControl>
                                        <Input
                                            id="email"
                                            placeholder="Digite seu email..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem className="my-1">
                                    <FormLabel className="font-semibold">Telefone:</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            id="phone"
                                            placeholder="(XX) XXXXX-XXXX"
                                            onChange={(e) => {
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
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-2 space-y-1">
                                    <FormLabel className="font-semibold">Data do agendamento:</FormLabel>
                                    <FormControl>
                                        <DateTimePicker
                                            initialDate={new Date()}
                                            className="w-full rounded border p-2"
                                            onChange={(date) => {
                                                if (date) {
                                                    field.onChange(date)
                                                    setSelectedTime('')
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="serviceId"
                            render={({ field }) => {
                                const selectedService = clinic.services.find(
                                    (service) => String(service.id) === String(field.value)
                                )

                                return (
                                    <FormItem className="w-full">
                                        <FormLabel className="font-semibold">Selecione o serviço:</FormLabel>
                                        <FormControl >
                                            <Select
                                                value={field.value || undefined}
                                                onValueChange={(value) => {
                                                    field.onChange(value)
                                                    setSelectedTime('')
                                                }}

                                            >
                                                <SelectTrigger className="w-full">
                                                    <span>
                                                        {selectedService
                                                            ? `${selectedService.name} - ${Math.floor(selectedService.duration / 60)}h ${selectedService.duration % 60}min`
                                                            : "Selecione um serviço"}
                                                    </span>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clinic.services.map((service) => (
                                                        <SelectItem key={service.id} value={String(service.id)}>
                                                            {service.name} - {Math.floor(service.duration / 60)}h {service.duration % 60}min
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />

                        {selectedServiceId && (
                            <div className='space-y-2'>
                                <Label className='font-semibold'>Horários disponiveis:</Label>
                                <div className="bg-gray-100 p-4 rounded-lg">
                                    {loadingSlots ? (
                                        <p>Carregando horários...</p>
                                    ) : availableTimeSlots.length === 0 ? (
                                        <p>Nenhum horário disponível</p>
                                    ) : (
                                        <ScheduleTimeList
                                            onSelectTime={(time) => setSelectedTime(time)}
                                            clinicTimes={clinic.times}
                                            blockedTimes={blockedTimes}
                                            availableTimeSlots={availableTimeSlots}
                                            selectedTime={selectedTime}
                                            selectedDate={selectedDate}
                                            requiredSlots={
                                                clinic.services.find(service => service.id === selectedServiceId) ? Math.ceil(clinic.services.find(service => service.id === selectedServiceId)!.duration / 30) : 1
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {clinic.status ? (
                            <Button
                                type="submit"
                                className="w-full bg-emerald-500 hover:bg-emerald-400"
                                disabled={!watch("name") || !watch("email") || !watch("phone") || !watch("date") || !watch("serviceId")}
                            >
                                Realizar Agendamento
                            </Button>
                        ) : (
                            <p className="bg-red-500 text-white text-center px-4 py-2 rounded-md">
                                A Clinica está fechada nesse momento.
                            </p>
                        )}
                    </form>
                </Form>
            </section>
        </div>
    )
}