import { Suspense } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import getSession from "@/lib/getSession"
import { sanitizeCallbackUrl } from "@/lib/auth-schemas"
import { AuthBrandPanel } from "../_components/auth-brand-panel"
import { RegisterForm } from "./_components/register-form"
import { ThemeToggle } from "@/components/theme-toggle"

export const metadata: Metadata = {
  title: "Criar conta - OdontoGEST",
  description: "Cadastre sua clínica odontológica no OdontoGEST.",
}

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const session = await getSession()
  const { callbackUrl } = await searchParams
  const targetUrl = sanitizeCallbackUrl(callbackUrl)

  if (session?.user?.id) {
    redirect(targetUrl)
  }

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-slate-950">
      <AuthBrandPanel />

      {/* Coluna Direita: Formulário de Cadastro */}
      <div className="relative flex flex-1 flex-col justify-center px-6 py-10 sm:px-12 lg:px-16">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <ThemeToggle />
        </div>

        <div className="mx-auto w-full max-w-md">
          {/* Logo compacto no mobile */}
          <div className="mb-8 lg:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl text-2xl font-black tracking-tight text-emerald-950 dark:text-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500 text-lg font-black text-white shadow-xs shadow-emerald-500/30">
                O
              </div>
              <span>
                Odonto<span className="text-emerald-500">GEST</span>
              </span>
            </Link>
          </div>

          <Suspense
            fallback={
              <div className="space-y-4">
                <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              </div>
            }
          >
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
