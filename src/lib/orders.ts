import { getOffering, isGameId, renderGreeting } from "@/lib/catalog"
import { domainError, normalizeDomain, suggestDomains } from "@/lib/domain"
import { OrderError } from "@/lib/errors"
import { resolvePhotos } from "@/lib/photos"
import { getRegistrar, type DomainRegistrar } from "@/lib/registrar"
import {
  dataFilePath,
  readDatabase,
  updateDatabase,
  type Order,
} from "@/lib/store"

export type OrderInput = {
  offeringId?: string
  domain?: string
  purposeId?: string
  optionId?: string
  recipientName?: string
  fromName?: string
  greeting?: string
  photos?: "sample" | { src: string; alt?: string }[]
}

export function cleanName(value: unknown): string {
  if (typeof value !== "string") return ""
  return value
    .replace(/[\u0000-\u001f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 40)
}

export async function searchDomains(
  seed: string,
  registrar: DomainRegistrar = getRegistrar(),
) {
  const ideas = suggestDomains(seed)
  if (ideas.length === 0) {
    return {
      results: [],
      error: "Type a name or a domain ending in .com, .site, or .fun.",
    }
  }
  const results = []
  for (const domain of ideas) {
    results.push(await registrar.checkAvailability(domain))
  }
  return { results }
}

export async function fulfillOrder(
  input: OrderInput,
  registrar: DomainRegistrar = getRegistrar(),
): Promise<Order> {
  const offering = getOffering(input.offeringId ?? "")
  if (!offering) {
    throw new OrderError("That gift is not available.", 400, "offering")
  }
  const purpose = offering.purposes.find((item) => item.id === input.purposeId)
  if (!purpose) {
    throw new OrderError("Choose a purpose for this gift.", 400, "purpose")
  }
  const option = purpose.options.find((item) => item.id === input.optionId)
  if (!option || !isGameId(option.gameId)) {
    throw new OrderError(
      "That option does not belong to the purpose you chose.",
      400,
      "option",
    )
  }

  const domain = normalizeDomain(input.domain ?? "")
  const invalid = domainError(domain)
  if (invalid) throw new OrderError(invalid, 400, "domain")

  const recipientName = cleanName(input.recipientName)
  const fromName = cleanName(input.fromName)
  if (!recipientName) {
    throw new OrderError("Enter the recipient's name.", 400, "recipient")
  }
  if (!fromName) throw new OrderError("Enter your name.", 400, "from")

  const greetingSource =
    typeof input.greeting === "string" && input.greeting.trim()
      ? input.greeting.trim()
      : renderGreeting(purpose.greeting, recipientName, fromName)
  const greeting = greetingSource.replace(/[\u0000-\u001f]/g, "").slice(0, 280)
  if (!greeting) throw new OrderError("Write a greeting.", 400, "greeting")

  const photos = resolvePhotos(input.photos, recipientName)
  const availability = await registrar.checkAvailability(domain)
  if (!availability.available) {
    throw new OrderError(`${domain} is not available.`, 409, "unavailable")
  }

  const orderId = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  let registration
  try {
    registration = await registrar.register({ domain, years: 1, orderId })
  } catch (error) {
    const message = error instanceof Error ? error.message : `${domain} is not available.`
    throw new OrderError(
      message.includes("not available") ? message : `${domain} is not available.`,
      409,
      "unavailable",
    )
  }

  const order: Order = {
    id: orderId,
    offeringId: offering.id,
    domain,
    purposeId: purpose.id,
    optionId: option.id,
    gameId: option.gameId,
    recipientName,
    fromName,
    greeting,
    photos,
    registrationId: registration.id,
    createdAt,
  }

  return updateDatabase(dataFilePath(), (db) => {
    db.orders.push(order)
    return order
  })
}

export async function getOrder(id: string, file = dataFilePath()): Promise<Order | null> {
  const db = await readDatabase(file)
  return db.orders.find((order) => order.id === id) ?? null
}

export async function getOrderByDomain(
  domain: string,
  file = dataFilePath(),
): Promise<Order | null> {
  const normalized = normalizeDomain(domain)
  const db = await readDatabase(file)
  return db.orders.find((order) => order.domain === normalized) ?? null
}

export async function listOrders(file = dataFilePath()): Promise<Order[]> {
  const db = await readDatabase(file)
  return [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function sitePath(domain: string): string {
  return `/sites/${encodeURIComponent(domain)}`
}
