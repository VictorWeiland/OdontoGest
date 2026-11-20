import { Suspense } from "react"
import getSession from "@/lib/getSession"
import { redirect } from "next/navigation"
import { ServicesContent } from "./_components/service-content"
import { Skeleton } from "@/components/ui/skeleton"

export default async function Services() {
  const session = await getSession()

  if (!session?.user?.id) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl">
          Serviços da Clínica
        </h2>
        <p className="text-sm text-slate-500">
          Cadastre e gerencie os procedimentos disponíveis para agendamento online.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        }
      >
        <ServicesContent userId={session.user.id} />
      </Suspense>
    </div>
  )
}
