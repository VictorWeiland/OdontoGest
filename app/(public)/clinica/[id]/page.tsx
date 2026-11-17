import { redirect } from "next/navigation"
import { getInfoSchedule } from "./_data-access/get-info-schedule"
import { ScheduleContent } from "./_components/schedule-content"
import type { Metadata } from "next"

interface SchedulePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: SchedulePageProps): Promise<Metadata> {
  const { id } = await params
  const clinic = await getInfoSchedule({ userId: id })

  if (!clinic) {
    return {
      title: "Clínica não encontrada - OdontoGEST",
    }
  }

  const title = `Agendar Horário - ${clinic.name || "Clínica Odontológica"} | OdontoGEST`
  const description = clinic.address
    ? `Agende sua consulta online em ${clinic.name}. Endereço: ${clinic.address}. Horários flexíveis e confirmação rápida.`
    : `Agende sua consulta online em ${clinic.name} pelo OdontoGEST.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: clinic.image ? [{ url: clinic.image }] : [],
    },
  }
}

export default async function SchedulePage({ params }: SchedulePageProps) {
  const { id } = await params
  const user = await getInfoSchedule({ userId: id })

  if (!user) {
    redirect("/")
  }

  return <ScheduleContent clinic={user} />
}
