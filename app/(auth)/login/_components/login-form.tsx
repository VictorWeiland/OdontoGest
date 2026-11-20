"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowLeft, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { loginSchema, sanitizeCallbackUrl, type LoginFormData } from "@/lib/auth-schemas"

function getUrlErrorMessage(errorParam: string | null): string | null {
  if (!errorParam) return null
  if (errorParam === "OAuthAccountNotLinked") {
    return "Já existe uma conta cadastrada com este e-mail usando outro método. Entre com sua senha ou use o provedor original."
  }
  if (errorParam === "AccessDenied") {
    return "Acesso não autorizado. Verifique sua conta e tente novamente."
  }
  if (errorParam === "CredentialsSignin") {
    return "E-mail ou senha incorretos"
  }
  return "Não foi possível concluir o login. Tente novamente."
}

function getSupportHref(): string | null {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim()
  const rawPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim()

  if (rawPhone) {
    const cleanPhone = rawPhone.replace(/\D/g, "")
    if (cleanPhone) {
      const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`
      return `https://wa.me/${fullPhone}?text=${encodeURIComponent(
        "Olá! Preciso de ajuda para acessar minha conta no OdontoGEST."
      )}`
    }
  }

  if (contactEmail) {
    return `mailto:${contactEmail}?subject=${encodeURIComponent(
      "Ajuda com acesso - OdontoGEST"
    )}`
  }

  return null
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCallbackUrl = searchParams.get("callbackUrl")
  const targetUrl = sanitizeCallbackUrl(rawCallbackUrl)
  const urlError = getUrlErrorMessage(searchParams.get("error"))

  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const supportUrl = getSupportHref()
  const activeError = serverError ?? urlError
  const isBusy = isSubmitting || isGoogleLoading

  async function onSubmit(data: LoginFormData) {
    setServerError(null)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: targetUrl,
      })

      if (!result || result.error) {
        if (result?.code?.startsWith("rate_limit:")) {
          const seconds = Number(result.code.split(":")[1] || "60")
          const minutes = Math.ceil(seconds / 60)
          const waitText =
            seconds >= 60
              ? `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`
              : `${seconds} segundos`
          setServerError(
            `Muitas tentativas em excesso. Aguarde ${waitText} antes de tentar novamente.`
          )
        } else {
          setServerError("E-mail ou senha incorretos")
        }
        return
      }

      toast.success("Login realizado com sucesso!")
      router.push(targetUrl)
      router.refresh()
    } catch {
      setServerError("Não foi possível conectar ao servidor. Tente novamente.")
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true)
    setServerError(null)
    try {
      await signIn("google", {
        callbackUrl: targetUrl,
      })
    } catch {
      setServerError("Falha ao iniciar o login com Google. Tente novamente.")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-xs font-semibold text-slate-600 transition-colors duration-150 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Voltar para o site
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl">
          Acesse sua clínica
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Entre com seu e-mail e senha ou acesse com sua conta Google.
        </p>
      </div>

      {/* Área de erros acessível via aria-live */}
      <div aria-live="polite">
        {activeError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          >
            {activeError}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-slate-700 font-semibold">
            E-mail
          </Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500"
              aria-hidden
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu@consultorio.com.br"
              disabled={isBusy}
              aria-invalid={Boolean(errors.email)}
              className="h-11 rounded-xl border-slate-200 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/25"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-red-700" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-slate-700 font-semibold">
            Senha
          </Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500"
              aria-hidden
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Sua senha de acesso"
              disabled={isBusy}
              aria-invalid={Boolean(errors.password)}
              className="h-11 rounded-xl border-slate-200 pl-10 pr-11 text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/25"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-600"
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
            <p className="text-xs font-medium text-red-700" role="alert">
              {errors.password.message}
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
              Entrando...
            </span>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>

      {/* Divisor "ou" */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-slate-200" />
        <span className="absolute bg-white px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          ou
        </span>
      </div>

      {/* Botão Google */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={isBusy}
        className="h-11 w-full gap-2.5 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-600"
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

      {/* Link para Cadastro */}
      <p className="text-center text-sm text-slate-600">
        Ainda não tem conta?{" "}
        <Link
          href={`/cadastro${rawCallbackUrl ? `?callbackUrl=${encodeURIComponent(targetUrl)}` : ""}`}
          className="rounded-md font-bold text-emerald-700 hover:text-emerald-800 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-600"
        >
          Criar conta
        </Link>
      </p>

      {/* Suporte (sem serviço de e-mail transacional configurado) */}
      {supportUrl && (
        <div className="border-t border-slate-100 pt-4 text-center">
          <a
            href={supportUrl}
            target={supportUrl.startsWith("http") ? "_blank" : undefined}
            rel={supportUrl.startsWith("http") ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-slate-600 transition-colors hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            <MessageCircle className="size-3.5 text-emerald-600" aria-hidden />
            Precisa de ajuda? Fale com o suporte
          </a>
        </div>
      )}
    </div>
  )
}
