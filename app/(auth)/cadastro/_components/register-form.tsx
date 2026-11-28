"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Lock, Mail, User, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  registerSchema,
  sanitizeCallbackUrl,
  type RegisterFormData,
} from "@/lib/auth-schemas"
import { registerUser } from "../../_actions/register"

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCallbackUrl = searchParams.get("callbackUrl")
  const targetUrl = sanitizeCallbackUrl(rawCallbackUrl)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  })

  const isBusy = isSubmitting || isGoogleLoading

  async function onSubmit(data: RegisterFormData) {
    setServerError(null)
    try {
      const response = await registerUser(data)

      if (response.error) {
        setServerError(response.error)
        return
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: targetUrl,
      })

      if (signInResult?.error) {
        toast.success("Conta criada! Faça login para continuar.")
        router.push("/login")
        return
      }

      toast.success("Conta criada com sucesso!")
      router.push(targetUrl)
      router.refresh()
    } catch {
      setServerError("Não foi possível concluir o cadastro. Tente novamente.")
    }
  }

  async function handleGoogleRegister() {
    setIsGoogleLoading(true)
    setServerError(null)
    try {
      await signIn("google", {
        callbackUrl: targetUrl,
      })
    } catch {
      setServerError("Falha ao iniciar cadastro com Google. Tente novamente.")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-xs font-semibold text-slate-600 transition-colors duration-150 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Voltar para o site
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl dark:text-emerald-50">
          Crie sua conta
        </h2>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
          Cadastre sua clínica ou consultório para começar a usar o OdontoGEST.
        </p>
      </div>

      <div aria-live="polite">
        {serverError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-200"
          >
            {serverError}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-slate-700 font-semibold dark:text-slate-200">
            Nome da clínica ou profissional
          </Label>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
              aria-hidden
            />
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Ex.: Clínica Sorriso ou Dra. Ana Silva"
              disabled={isBusy}
              aria-invalid={Boolean(errors.name)}
              className="h-11 rounded-xl border-slate-200 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/25 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-xs font-medium text-red-700 dark:text-red-400" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-slate-700 font-semibold dark:text-slate-200">
            E-mail
          </Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
              aria-hidden
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu@consultorio.com.br"
              disabled={isBusy}
              aria-invalid={Boolean(errors.email)}
              className="h-11 rounded-xl border-slate-200 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/25 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-red-700 dark:text-red-400" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-slate-700 font-semibold dark:text-slate-200">
            Senha
          </Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
              aria-hidden
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo de 8 caracteres"
              disabled={isBusy}
              aria-invalid={Boolean(errors.password)}
              className="h-11 rounded-xl border-slate-200 pl-10 pr-11 text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/25 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-red-700 dark:text-red-400" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="confirmPassword"
            className="text-slate-700 font-semibold dark:text-slate-200"
          >
            Confirmar senha
          </Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
              aria-hidden
            />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repita sua senha"
              disabled={isBusy}
              aria-invalid={Boolean(errors.confirmPassword)}
              className="h-11 rounded-xl border-slate-200 pl-10 pr-11 text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/25 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label={
                showConfirmPassword
                  ? "Ocultar confirmação de senha"
                  : "Mostrar confirmação de senha"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs font-medium text-red-700 dark:text-red-400" role="alert">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-start gap-2.5">
            <input
              id="termsAccepted"
              type="checkbox"
              disabled={isBusy}
              aria-invalid={Boolean(errors.termsAccepted)}
              className="mt-0.5 size-4 shrink-0 rounded border-slate-300 text-emerald-600 accent-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-slate-700 dark:bg-slate-900"
              {...register("termsAccepted")}
            />
            <label
              htmlFor="termsAccepted"
              className="text-xs leading-relaxed text-slate-600 select-none dark:text-slate-400"
            >
              Li e concordo com os{" "}
              <Link
                href="/termos"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link
                href="/privacidade"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Política de Privacidade
              </Link>
              .
            </label>
          </div>
          {errors.termsAccepted && (
            <p className="text-xs font-medium text-red-700 dark:text-red-400" role="alert">
              {errors.termsAccepted.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isBusy}
          className="h-11 w-full rounded-xl bg-emerald-500 text-sm font-bold text-white shadow-sm shadow-emerald-500/20 transition-all duration-150 hover:bg-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Criando conta...
            </span>
          ) : (
            "Criar conta"
          )}
        </Button>
      </form>

      {/* Divisor "ou" */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        <span className="absolute bg-white px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-950 dark:text-slate-400">
          ou
        </span>
      </div>

      {/* Botão Google */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleRegister}
        disabled={isBusy}
        className="h-11 w-full gap-2.5 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {isGoogleLoading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>Entrar com Google</span>
      </Button>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Já tem uma conta?{" "}
        <Link
          href={`/login${rawCallbackUrl ? `?callbackUrl=${encodeURIComponent(targetUrl)}` : ""}`}
          className="rounded-md font-bold text-emerald-700 hover:text-emerald-800 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Entrar
        </Link>
      </p>
    </div>
  )
}
