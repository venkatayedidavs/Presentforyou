import { OrderError } from "@/lib/errors"
import { fulfillOrder, sitePath, type OrderInput } from "@/lib/orders"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Send the gift as JSON." }, { status: 400 })
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Send the gift as JSON." }, { status: 400 })
  }

  try {
    const order = await fulfillOrder(body as OrderInput)
    return NextResponse.json({ order, sitePath: sitePath(order.domain) }, { status: 201 })
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }
    console.error(error)
    return NextResponse.json(
      { error: "Something went wrong while publishing the site." },
      { status: 500 },
    )
  }
}
