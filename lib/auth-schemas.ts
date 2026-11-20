import { z } from "zod"

/**
 * Valida callbackUrl para permitir apenas caminhos internos do próprio site
 * (evita open redirect via //dominio, /\dominio ou URLs externas).
 */
export function sanitizeCallbackUrl(url?: string | null): string {
  if (!url) return "/dashboard"

  const trimmed = url.trim()
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\") ||
    trimmed.includes("\\") ||
    /[\x00-\x1f\x7f]/.test(trimmed)
  ) {
    return "/dashboard"
  }

  try {
    const parsed = new URL(trimmed, "http://localhost")
    if (parsed.origin !== "http://localhost") {
      return "/dashboard"
    }
    if (parsed.pathname === "/login" || parsed.pathname === "/cadastro") {
      return "/dashboard"
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return "/dashboard"
  }
}

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Informe seu e-mail." })
    .email({ message: "Informe um endereço de e-mail válido." })
    .transform((val) => val.toLowerCase()),
  password: z.string().min(1, { message: "Informe sua senha." }),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "O nome deve ter no mínimo 2 caracteres." })
      .max(100, { message: "O nome não pode exceder 100 caracteres." }),
    email: z
      .string()
      .trim()
      .email({ message: "Informe um endereço de e-mail válido." })
      .transform((val) => val.toLowerCase()),
    password: z
      .string()
      .min(8, { message: "A senha deve conter no mínimo 8 caracteres." })
      .max(128, { message: "A senha não pode exceder 128 caracteres." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirme sua senha." }),
    termsAccepted: z
      .boolean()
      .refine((val) => val === true, {
        message: "Você deve aceitar os Termos de Uso e a Política de Privacidade.",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
