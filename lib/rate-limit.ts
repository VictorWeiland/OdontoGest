// Proteção em memória contra tentativas em excesso (por e-mail e por IP)

interface RateLimitEntry {
  attempts: number
  resetTime: number
}

const attemptsStore = new Map<string, RateLimitEntry>()

function pruneExpired(now: number) {
  if (attemptsStore.size < 500) return
  for (const [key, entry] of attemptsStore.entries()) {
    if (now > entry.resetTime) {
      attemptsStore.delete(key)
    }
  }
}

export function checkRateLimit(
  identifier: string,
  maxAttempts = 5
): { allowed: boolean; remainingSeconds: number } {
  const now = Date.now()
  pruneExpired(now)

  const record = attemptsStore.get(identifier)
  if (!record) {
    return { allowed: true, remainingSeconds: 0 }
  }

  if (now > record.resetTime) {
    attemptsStore.delete(identifier)
    return { allowed: true, remainingSeconds: 0 }
  }

  if (record.attempts >= maxAttempts) {
    const remainingSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000))
    return { allowed: false, remainingSeconds }
  }

  return { allowed: true, remainingSeconds: 0 }
}

export function recordAttempt(
  identifier: string,
  windowMs = 15 * 60 * 1000
) {
  const now = Date.now()
  pruneExpired(now)

  const record = attemptsStore.get(identifier)
  if (!record || now > record.resetTime) {
    attemptsStore.set(identifier, {
      attempts: 1,
      resetTime: now + windowMs,
    })
    return
  }

  record.attempts += 1
}

export function clearRateLimit(identifier: string) {
  attemptsStore.delete(identifier)
}

export function extractClientIp(headers?: Headers | null): string {
  if (!headers) return "unknown"
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  const realIp = headers.get("x-real-ip")?.trim()
  if (realIp) return realIp
  return "unknown"
}
