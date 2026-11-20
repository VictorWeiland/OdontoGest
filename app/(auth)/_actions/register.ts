"use server"

import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { registerSchema, type RegisterFormData } from "@/lib/auth-schemas"
import { checkRateLimit, recordAttempt, extractClientIp } from "@/lib/rate-limit"

export async function registerUser(formData: RegisterFormData) {
  const reqHeaders = await headers()
  const ip = extractClientIp(reqHeaders)
  const ipKey = `register:ip:${ip}`

  if (ip !== "unknown") {
    const ipLimit = checkRateLimit(ipKey, 10)
    if (!ipLimit.allowed) {
      return {
        error: `Muitas tentativas de cadastro. Aguarde ${ipLimit.remainingSeconds} segundos e tente novamente.`,
      }
    }
  }

  const parsed = registerSchema.safeParse(formData)

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Verifique os dados informados.",
    }
  }

  const { name, email, password } = parsed.data

  try {
    if (ip !== "unknown") {
      recordAttempt(ipKey, 15 * 60 * 1000)
    }

    // Verifica se o e-mail já existe (inclusive criado via OAuth), sem vincular automaticamente
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      return {
        error:
          "Este e-mail já está cadastrado. Entre com Google ou com sua senha",
      }
    }

    // Hash com bcrypt (custo 12)
    const passwordHash = await bcrypt.hash(password, 12)

    // Cria o usuário com os mesmos campos padrão de um login via Google OAuth
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        status: true,
        address: "",
        phone: "",
        times: [],
        specialties: [],
        isDemo: false,
      },
    })

    return {
      success: true,
    }
  } catch {
    return {
      error: "Ocorreu um erro ao criar sua conta. Tente novamente em instantes.",
    }
  }
}
