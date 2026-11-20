import NextAuth, { CredentialsSignin } from "next-auth"
import prisma from "./prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Adapter } from "next-auth/adapters"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import {
  checkRateLimit,
  recordAttempt,
  clearRateLimit,
  extractClientIp,
} from "./rate-limit"

class RateLimitSigninError extends CredentialsSignin {
  constructor(remainingSeconds: number) {
    super()
    this.code = `rate_limit:${remainingSeconds}`
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = String(credentials.email).toLowerCase().trim()
        const password = String(credentials.password)
        const ip = extractClientIp(request?.headers)

        const emailKey = `login:email:${email}`
        const ipKey = `login:ip:${ip}`

        // Limite de tentativas por e-mail (5 em 15 min) e por IP (15 em 15 min)
        const emailLimit = checkRateLimit(emailKey, 5)
        if (!emailLimit.allowed) {
          throw new RateLimitSigninError(emailLimit.remainingSeconds)
        }

        if (ip !== "unknown") {
          const ipLimit = checkRateLimit(ipKey, 15)
          if (!ipLimit.allowed) {
            throw new RateLimitSigninError(ipLimit.remainingSeconds)
          }
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            passwordHash: true,
          },
        })

        // Falha genérica sem revelar se o e-mail existe ou se foi criado via OAuth
        if (!user || !user.passwordHash) {
          recordAttempt(emailKey, 15 * 60 * 1000)
          if (ip !== "unknown") recordAttempt(ipKey, 15 * 60 * 1000)
          return null
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash)
        if (!passwordMatch) {
          recordAttempt(emailKey, 15 * 60 * 1000)
          if (ip !== "unknown") recordAttempt(ipKey, 15 * 60 * 1000)
          return null
        }

        clearRateLimit(emailKey)

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        if (typeof token?.id === "string") {
          session.user.id = token.id
        } else if (typeof token?.sub === "string") {
          session.user.id = token.sub
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Impede open redirect: aceita apenas caminhos relativos ou mesma origem
      if (url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\")) {
        return `${baseUrl}${url}`
      }
      try {
        const parsed = new URL(url)
        if (parsed.origin === baseUrl) {
          return url
        }
      } catch {
        // Fallback seguro
      }
      return `${baseUrl}/dashboard`
    },
  },
})
