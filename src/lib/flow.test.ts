import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { GREETING_SITE_ID, getOffering, listOfferings } from "@/lib/catalog"
import { suggestDomains } from "@/lib/domain"
import {
  fulfillOrder,
  getOrderByDomain,
  searchDomains,
} from "@/lib/orders"
import { getRegistrar, type DomainRegistrar, type RegisterInput } from "@/lib/registrar"
import { SAMPLE_PHOTOS } from "@/lib/photos"
import { readDatabase } from "@/lib/store"
import { afterEach, describe, expect, it, vi } from "vitest"

function useTempData() {
  process.env.DATA_DIR = mkdtempSync(path.join(tmpdir(), "given-"))
  process.env.REGISTRAR = "mock"
}

const originalRegistrar = process.env.REGISTRAR
const originalDataDir = process.env.DATA_DIR

afterEach(() => {
  if (originalRegistrar === undefined) delete process.env.REGISTRAR
  else process.env.REGISTRAR = originalRegistrar
  if (originalDataDir === undefined) delete process.env.DATA_DIR
  else process.env.DATA_DIR = originalDataDir
})

describe("version 1 gift flow", () => {
  it("checks a domain, registers it, and publishes greeting site content", async () => {
    useTempData()
    const search = await searchDomains("mina")
    const chosen = search.results.find((result) => result.domain === "mina.com")

    expect(chosen?.available).toBe(true)
    expect(chosen?.priceCents).toBe(1400)

    const taken = await searchDomains("birthday.com")
    expect(taken.results[0]).toMatchObject({
      domain: "birthday.com",
      available: false,
    })

    const offering = getOffering(GREETING_SITE_ID)
    expect(offering?.purposes.map((purpose) => purpose.id)).toEqual([
      "birthday",
      "first-day",
      "just-because",
    ])
    const birthday = offering?.purposes.find((purpose) => purpose.id === "birthday")
    expect(birthday?.options.map((option) => option.id)).toEqual([
      "balloon-pop",
      "candle-count",
    ])

    const order = await fulfillOrder(
      {
        offeringId: GREETING_SITE_ID,
        domain: "mina.com",
        purposeId: "birthday",
        optionId: "balloon-pop",
        recipientName: "Mina",
        fromName: "Asha",
        photos: "sample",
      },
    )

    expect(order.domain).toBe("mina.com")
    expect(order.purposeId).toBe("birthday")
    expect(order.optionId).toBe("balloon-pop")
    expect(order.gameId).toBe("balloon-pop")
    expect(order.greeting).toContain("Mina")
    expect(order.greeting.toLowerCase()).toContain("birthday")
    expect(order.photos).toEqual(SAMPLE_PHOTOS)

    const site = await getOrderByDomain("mina.com")
    expect(site?.greeting).toBe(order.greeting)
    expect(site?.photos).toHaveLength(3)
    expect(site?.gameId).toBe("balloon-pop")

    const registration = await getRegistrar().getRegistration("mina.com")
    expect(registration).toMatchObject({
      domain: "mina.com",
      provider: "mock",
      status: "registered",
      orderId: order.id,
    })

    await expect(
      fulfillOrder(
        {
          offeringId: GREETING_SITE_ID,
          domain: "mina.com",
          purposeId: "birthday",
          optionId: "candle-count",
          recipientName: "Mina",
          fromName: "Asha",
        },
      ),
    ).rejects.toThrow(/not available/)
  })

  it("fails if search or checkout bypasses the registrar", async () => {
    useTempData()
    const inner = getRegistrar()
    const checkAvailability = vi.fn((domain: string) => inner.checkAvailability(domain))
    const register = vi.fn((input: RegisterInput) => inner.register(input))
    const registrar: DomainRegistrar = {
      providerId: inner.providerId,
      checkAvailability,
      register,
      getRegistration: (domain) => inner.getRegistration(domain),
    }

    await searchDomains("mina", registrar)
    expect(checkAvailability.mock.calls.map((call) => call[0])).toEqual([
      "mina.com",
      "hello-mina.com",
      "mina.site",
      "for-mina.fun",
    ])

    checkAvailability.mockClear()
    const order = await fulfillOrder(
      {
        offeringId: GREETING_SITE_ID,
        domain: "hello-mina.com",
        purposeId: "birthday",
        optionId: "balloon-pop",
        recipientName: "Mina",
        fromName: "Asha",
        photos: "sample",
      },
      registrar,
    )

    expect(checkAvailability).toHaveBeenCalledWith("hello-mina.com")
    expect(register).toHaveBeenCalledTimes(1)
    expect(register.mock.calls[0]?.[0]).toMatchObject({
      domain: "hello-mina.com",
      years: 1,
      orderId: order.id,
    })
    const recorded = await registrar.getRegistration("hello-mina.com")
    expect(recorded?.id).toBe(order.registrationId)
    expect(recorded?.provider).toBe(registrar.providerId)
    const db = await readDatabase()
    expect(db.registrations).toHaveLength(1)
    expect(db.registrations[0]?.id).toBe(order.registrationId)
  })

  it("rejects a game that does not belong to the purpose", async () => {
    await expect(
      fulfillOrder(
        {
          offeringId: GREETING_SITE_ID,
          domain: "hello-mina.site",
          purposeId: "birthday",
          optionId: "memory-match",
          recipientName: "Mina",
          fromName: "Asha",
        },
      ),
    ).rejects.toThrow(/does not belong/)
  })

  it("sells only the greeting site", () => {
    expect(listOfferings().map((offering) => offering.id)).toEqual([GREETING_SITE_ID])
    expect(suggestDomains("Mina")).toEqual([
      "mina.com",
      "hello-mina.com",
      "mina.site",
      "for-mina.fun",
    ])
  })

  it("refuses a registrar other than the mock", () => {
    process.env.REGISTRAR = "namecheap"
    expect(() => getRegistrar()).toThrow(/mock registrar/)
  })
})
