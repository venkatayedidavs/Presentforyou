import { searchDomains } from "@/lib/orders"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Send a name or domain to check." }, { status: 400 })
  }
  const seed =
    body && typeof body === "object" && "seed" in body && typeof body.seed === "string"
      ? body.seed
      : ""
  const payload = await searchDomains(seed)
  return NextResponse.json(payload)
}
