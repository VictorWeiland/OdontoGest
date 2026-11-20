import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { sanitizeCallbackUrl } from "@/lib/auth-schemas"

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const session = await auth()
  const isAuthenticated = Boolean(session?.user?.id)

  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    const internalTarget = sanitizeCallbackUrl(`${pathname}${search}`)
    if (internalTarget !== "/dashboard") {
      loginUrl.searchParams.set("callbackUrl", internalTarget)
    }
    return NextResponse.redirect(loginUrl)
  }

  if ((pathname === "/login" || pathname === "/cadastro") && isAuthenticated) {
    const target = sanitizeCallbackUrl(request.nextUrl.searchParams.get("callbackUrl"))
    return NextResponse.redirect(new URL(target, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/cadastro"],
}
