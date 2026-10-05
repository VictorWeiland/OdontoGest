import { LabelSubcription } from '@/components/ui/label-subscription';
import { getAllServices } from '../_data-access/get-all-services'
import { ServiceList } from './services-list';
import { canPermission } from "@/utils/permissions/canPermission"


interface ServicesContentProps {
    userId: string;
}

export async function ServicesContent({ userId }: ServicesContentProps) {

    const services = await getAllServices({ userId: userId })
    const permission = await canPermission({ type: "service" })


    return (
        <>
  
            {!permission.hasPermission && (
                <LabelSubcription expired={permission.expired} />
            )}
            <ServiceList services={services.data || []} permission={permission} />
        </>
    )
}