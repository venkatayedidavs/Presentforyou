const RESERVED = new Set([
  "google.com",
  "example.com",
  "given.com",
  "birthday.com",
  "test.com",
])

const PRICES: Record<string, number> = {
  com: 1400,
  site: 800,
  fun: 600,
}

export function listedDomainPrices(): { tld: string; cents: number }[] {
  return Object.entries(PRICES).map(([tld, cents]) => ({ tld, cents }))
}

const DOMAIN_PATTERN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|site|fun)$/

export function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "")
}

export function domainError(domain: string): string | null {
  if (!domain) return "Enter a domain."
  if (!DOMAIN_PATTERN.test(domain)) {
    return "Use a name ending in .com, .site, or .fun."
  }
  return null
}

export function priceCents(domain: string): number {
  const tld = domain.split(".").pop() ?? ""
  return PRICES[tld] ?? 0
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

export function isReserved(domain: string): boolean {
  return RESERVED.has(domain) || domain.split(".")[0] === "taken"
}

export function slugify(seed: string): string {
  return seed
    .trim()
    .toLowerCase()
    .replace(/\.(com|site|fun)$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
}

export function suggestDomains(seed: string): string[] {
  const suggestions: string[] = []
  const direct = normalizeDomain(seed)
  if (domainError(direct) === null) suggestions.push(direct)

  const slug = slugify(seed)
  if (slug) {
    for (const domain of [
      `${slug}.com`,
      `hello-${slug}.com`,
      `${slug}.site`,
      `for-${slug}.fun`,
    ]) {
      if (!suggestions.includes(domain) && domainError(domain) === null) {
        suggestions.push(domain)
      }
    }
  }

  return suggestions.slice(0, 4)
}
