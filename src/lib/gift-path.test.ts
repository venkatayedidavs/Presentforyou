import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { createElement, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import { POST as checkDomains } from "@/app/api/domains/check/route"
import { POST as publishGift } from "@/app/api/orders/route"
import PublishedSitePage from "@/app/sites/[domain]/page"
import { GREETING_SITE_ID, getOffering } from "@/lib/catalog"
import { getRegistrar } from "@/lib/registrar"

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children?: ReactNode
  }) => createElement("a", { href, ...props }, children),
}))

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND")
  },
}))

const pixel =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

const kidPhotos = [
  { src: pixel, alt: "Mina at the park" },
  { src: pixel, alt: "Mina with a cake" },
  { src: pixel, alt: "Mina on the steps" },
]

const originalRegistrar = process.env.REGISTRAR
const originalDataDir = process.env.DATA_DIR

afterEach(() => {
  if (originalRegistrar === undefined) delete process.env.REGISTRAR
  else process.env.REGISTRAR = originalRegistrar
  if (originalDataDir === undefined) delete process.env.DATA_DIR
  else process.env.DATA_DIR = originalDataDir
})

describe("parent gift path", () => {
  it("picks a domain, purpose, and game, then the mock registrar publishes the greeting site", async () => {
    process.env.REGISTRAR = "mock"
    process.env.DATA_DIR = mkdtempSync(path.join(tmpdir(), "given-gift-"))

    const check = await checkDomains(
      new Request("http://given.test/api/domains/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ seed: "mina" }),
      }),
    )
    expect(check.status).toBe(200)
    const search = (await check.json()) as {
      results: { domain: string; available: boolean }[]
    }
    const domain = search.results.find((result) => result.domain === "mina.com")
    expect(domain).toMatchObject({ domain: "mina.com", available: true })

    const offering = getOffering(GREETING_SITE_ID)
    const purpose = offering?.purposes.find((item) => item.id === "birthday")
    const option = purpose?.options.find((item) => item.id === "balloon-pop")
    expect(purpose).toMatchObject({ label: "Birthday gift for my kid" })
    expect(option).toMatchObject({ name: "Balloon pop", gameId: "balloon-pop" })

    const registrar = getRegistrar()
    expect(registrar.providerId).toBe("mock")
    expect(await registrar.getRegistration("mina.com")).toBeNull()

    const published = await publishGift(
      new Request("http://given.test/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          offeringId: offering?.id,
          domain: domain?.domain,
          purposeId: purpose?.id,
          optionId: option?.id,
          recipientName: "Mina",
          fromName: "Asha",
          photos: kidPhotos,
        }),
      }),
    )
    expect(published.status).toBe(201)
    const body = (await published.json()) as {
      sitePath: string
      order: { id: string; domain: string; greeting: string; gameId: string }
    }
    expect(body.sitePath).toBe("/sites/mina.com")
    expect(body.order.gameId).toBe("balloon-pop")
    expect(body.order.greeting).toBe(
      "Mina, this domain is yours. Happy birthday. — Asha",
    )

    const registration = await getRegistrar().getRegistration("mina.com")
    expect(registration).toMatchObject({
      domain: "mina.com",
      provider: "mock",
      status: "registered",
      orderId: body.order.id,
    })

    const page = await PublishedSitePage({
      params: Promise.resolve({ domain: "mina.com" }),
    })
    const html = renderToStaticMarkup(page)

    expect(html).toContain("mina.com")
    expect(html).toContain("Mina, this domain is yours. Happy birthday. — Asha")
    expect(html).toContain("Balloon pop")
    expect(html).toContain("Balloons for Mina")
    const gameAt = html.indexOf("Balloons for Mina")
    const firstPhotoAt = html.indexOf("Mina at the park")
    expect(gameAt).toBeGreaterThan(-1)
    expect(firstPhotoAt).toBeGreaterThan(gameAt)
    expect(html).toContain("Mina with a cake")
    expect(html).toContain("Mina on the steps")
    expect(html).toContain('alt="Mina at the park"')
    expect(html.match(/data:image\/png;base64,/g)).toHaveLength(3)
  })
})
