import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  loginSchema,
  registerSchema,
  sanitizeCallbackUrl,
} from "../auth-schemas.ts"

describe("sanitizeCallbackUrl", () => {
  it("mantém caminhos internos válidos com query e hash", () => {
    assert.equal(sanitizeCallbackUrl("/dashboard"), "/dashboard")
    assert.equal(
      sanitizeCallbackUrl("/dashboard?date=2026-11-28#agenda"),
      "/dashboard?date=2026-11-28#agenda"
    )
    assert.equal(sanitizeCallbackUrl("/clinica/123"), "/clinica/123")
  })

  it("bloqueia tentativas de open redirect e caminhos de auth", () => {
    assert.equal(sanitizeCallbackUrl(null), "/dashboard")
    assert.equal(sanitizeCallbackUrl(""), "/dashboard")
    assert.equal(sanitizeCallbackUrl("https://evil.com"), "/dashboard")
    assert.equal(sanitizeCallbackUrl("//evil.com"), "/dashboard")
    assert.equal(sanitizeCallbackUrl("/\\evil.com"), "/dashboard")
    assert.equal(sanitizeCallbackUrl("/dashboard\\test"), "/dashboard")
    assert.equal(sanitizeCallbackUrl("/login"), "/dashboard")
    assert.equal(sanitizeCallbackUrl("/cadastro"), "/dashboard")
  })
})

describe("loginSchema e registerSchema", () => {
  it("normaliza e-mail para minúsculas no login", () => {
    const parsed = loginSchema.safeParse({
      email: "  Clinica@OdontoGEST.com.br ",
      password: "Password123!",
    })
    assert.equal(parsed.success, true)
    assert.equal(parsed.data.email, "clinica@odontogest.com.br")
  })

  it("rejeita cadastro sem aceitar termos ou com senhas divergentes", () => {
    const withoutTerms = registerSchema.safeParse({
      name: "Clínica Sorriso",
      email: "teste@clinica.com",
      password: "Password123!",
      confirmPassword: "Password123!",
      termsAccepted: false,
    })
    assert.equal(withoutTerms.success, false)

    const mismatch = registerSchema.safeParse({
      name: "Clínica Sorriso",
      email: "teste@clinica.com",
      password: "Password123!",
      confirmPassword: "Password999!",
      termsAccepted: true,
    })
    assert.equal(mismatch.success, false)
  })
})
