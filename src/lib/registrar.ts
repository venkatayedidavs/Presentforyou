import { domainError, isReserved, normalizeDomain, priceCents } from "@/lib/domain"
import type { Registration } from "@/lib/store"
import { dataFilePath, readDatabase, updateDatabase } from "@/lib/store"

export type Availability = {
  domain: string
  available: boolean
  priceCents: number
  reason?: string
}

export type RegisterInput = {
  domain: string
  years: number
  orderId: string
}

/**
 * Swap a real registrar in later by implementing this interface and
 * returning it from getRegistrar when REGISTRAR names that provider.
 * Version 1 ships only the mock.
 */
export interface DomainRegistrar {
  readonly providerId: string
  checkAvailability(domain: string): Promise<Availability>
  register(input: RegisterInput): Promise<Registration>
  getRegistration(domain: string): Promise<Registration | null>
}

export function createMockRegistrar(file = dataFilePath()): DomainRegistrar {
  const providerId = "mock"
  return {
    providerId,
    async checkAvailability(raw: string) {
      return availabilityFor(raw, file)
    },
    async register(input: RegisterInput) {
      const domain = normalizeDomain(input.domain)
      const invalid = domainError(domain)
      if (invalid) {
        throw new Error(invalid)
      }
      return updateDatabase(file, (db) => {
        if (isReserved(domain) || db.registrations.some((item) => item.domain === domain)) {
          throw new Error(`${domain} is not available.`)
        }
        const record: Registration = {
          id: crypto.randomUUID(),
          domain,
          provider: providerId,
          status: "registered",
          years: input.years,
          priceCents: priceCents(domain),
          registeredAt: new Date().toISOString(),
          orderId: input.orderId,
        }
        db.registrations.push(record)
        return record
      })
    },
    async getRegistration(raw: string) {
      const domain = normalizeDomain(raw)
      const db = await readDatabase(file)
      return db.registrations.find((item) => item.domain === domain) ?? null
    },
  }
}

export async function availabilityFor(
  raw: string,
  file = dataFilePath(),
): Promise<Availability> {
  const domain = normalizeDomain(raw)
  const invalid = domainError(domain)
  if (invalid) {
    return { domain, available: false, priceCents: 0, reason: invalid }
  }
  const db = await readDatabase(file)
  if (isReserved(domain) || db.registrations.some((item) => item.domain === domain)) {
    return {
      domain,
      available: false,
      priceCents: priceCents(domain),
      reason: "Already registered.",
    }
  }
  return { domain, available: true, priceCents: priceCents(domain) }
}

export function getRegistrar(): DomainRegistrar {
  const which = process.env.REGISTRAR ?? "mock"
  if (which === "mock") return createMockRegistrar()
  throw new Error(
    `Registrar "${which}" is not available. Version 1 only includes the mock registrar.`,
  )
}
