"use client"
import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { DialogService } from './dialog-service'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Button } from "@/components/ui/button"
import { Pencil, Plus, X } from 'lucide-react'
import { Service } from '@/lib/generated/prisma/client'
import { formatCurrency } from '@/utils/formatCurrency'
import { deleteService } from '../_actions/delete-service'
import { toast } from 'sonner'
import { ResultPermissionProps } from '@/utils/permissions/canPermission'
import Link from 'next/link'
import { TRIAL_MAX_SERVICES } from '@/utils/permissions/trial-limits'

interface ServiceListProps {
    services: Service[];
    permission: ResultPermissionProps;
}

export function ServiceList({ services, permission }: ServiceListProps) {

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingService, setEditingService] = useState<null | Service>(null)

    const serviceList = permission.hasPermission
        ? services
        : services.slice(0, permission.plan?.maxServices ?? TRIAL_MAX_SERVICES);

    async function handleDeleteService(serviceId: string) {
        const response = await deleteService({ serviceId: serviceId })
        if (response.error) {
            toast(response.error)
            return;
        }
        toast.success(response.data)
    }

    function handleEditService(service: Service) {
        setEditingService(service);
        setIsDialogOpen(true);
    }

    function handleDialogChange(open: boolean) {
        setIsDialogOpen(open);

        if (!open) {
            setEditingService(null);
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <section className='mx-auto'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-xl md:text-2xl font-bold'>Serviços</CardTitle>
                        {permission.hasPermission && (
                            <DialogTrigger
                                render={
                                    <Button onClick={() => setEditingService(null)} />
                                }
                            >
                                <Plus className='w-4 h-4' />
                            </DialogTrigger>
                        )}
                        {!permission.hasPermission && (
                            <Link href="/dashboard/plans" className="text-red-500 hover:text-red-400" title="Atualize seu plano para adicionar mais serviços." >
                                Limite de serviços atingido.
                            </Link>
                        )}
                        <DialogContent>
                            <DialogService
                                key={editingService?.id ?? "new-service"}
                                closeModal={() => {
                                    setIsDialogOpen(false);
                                    setEditingService(null);
                                }}
                                serviceId={editingService ? editingService.id : undefined}
                                initialValues={editingService ? {
                                    name: editingService.name,
                                    price: (editingService.price / 100).toFixed(2).replace(".", ","),
                                    hours: Math.floor(editingService.duration / 60).toString(),
                                    minutes: (editingService.duration % 60).toString()
                                } : undefined}
                            />
                        </DialogContent>
                    </CardHeader>

                    <CardContent>
                        <section className='space-y-4 mt-4'>
                            {serviceList.map(service => (
                                <article
                                    key={service.id}
                                    className='flex items-center justify-between'
                                >
                                    <div className='flex items-center space-x-2'>
                                        <span className='font-medium'>{service.name}</span>
                                        <span className='text-gray-500'>-</span>
                                        <span className='text-gray-500'>{formatCurrency((service.price / 100))}</span>
                                    </div>
                                    <div>
                                        <Button
                                            title="Editar serviço"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEditService(service)}
                                        >
                                            <Pencil className='w-4 h-4' />
                                        </Button>
                                        <Button
                                            title="Excluir serviço"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteService(service.id)}
                                        >
                                            <X className='w-4 h-4' />
                                        </Button>
                                    </div>
                                </article>
                            ))}
                        </section>
                    </CardContent>
                </Card>
            </section>
        </Dialog>
    )
}