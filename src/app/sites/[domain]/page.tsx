import { GiftSite } from "@/components/gift-site"
import { Shell } from "@/components/site-frame"
import { getOffering } from "@/lib/catalog"
import { getOrderByDomain } from "@/lib/orders"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>
}): Promise<Metadata> {
  const { domain } = await params
  const order = await getOrderByDomain(decodeURIComponent(domain))
  if (!order) return { title: "Site not found" }
  return { title: order.domain, description: order.greeting }
}

export default async function PublishedSitePage({
  params,
}: {
  params: Promise<{ domain: string }>
}) {
  const { domain } = await params
  const order = await getOrderByDomain(decodeURIComponent(domain))
  if (!order) notFound()

  const offering = getOffering(order.offeringId)
  const purpose = offering?.purposes.find((item) => item.id === order.purposeId)
  const option = purpose?.options.find((item) => item.id === order.optionId)

  return (
    <Shell>
      <GiftSite
        domain={order.domain}
        recipientName={order.recipientName}
        greeting={order.greeting}
        gameId={order.gameId}
        gameName={option?.name ?? "Game"}
        photos={order.photos}
      />
    </Shell>
  )
}
