import { Shell } from "@/components/site-frame"
import { buttonVariants } from "@/components/ui/button"
import { getOffering } from "@/lib/catalog"
import { formatPrice, priceCents } from "@/lib/domain"
import { getOrder, sitePath } from "@/lib/orders"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export const metadata: Metadata = {
  title: "Gift published",
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrder(id)
  if (!order) notFound()

  const offering = getOffering(order.offeringId)
  const purpose = offering?.purposes.find((item) => item.id === order.purposeId)
  const option = purpose?.options.find((item) => item.id === order.optionId)

  return (
    <Shell>
      <main className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6">
        <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-primary uppercase">Receipt</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">The site is published.</h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          {order.domain} is recorded as registered. The greeting site is up. A live registrar would point the domain
          at this site. Here, the registration is stored on this machine and the site is served from it.
        </p>
        <dl className="mt-10 divide-y divide-border border-y border-border text-sm">
          <div className="grid grid-cols-[8rem_1fr] gap-3 py-3">
            <dt className="text-muted-foreground">Domain</dt>
            <dd className="font-medium">{order.domain}</dd>
          </div>
          <div className="grid grid-cols-[8rem_1fr] gap-3 py-3">
            <dt className="text-muted-foreground">Price</dt>
            <dd>{formatPrice(priceCents(order.domain))} for one year, not charged</dd>
          </div>
          <div className="grid grid-cols-[8rem_1fr] gap-3 py-3">
            <dt className="text-muted-foreground">Purpose</dt>
            <dd>{purpose?.label ?? order.purposeId}</dd>
          </div>
          <div className="grid grid-cols-[8rem_1fr] gap-3 py-3">
            <dt className="text-muted-foreground">Game</dt>
            <dd>{option?.name ?? order.gameId}</dd>
          </div>
          <div className="grid grid-cols-[8rem_1fr] gap-3 py-3">
            <dt className="text-muted-foreground">Greeting</dt>
            <dd>{order.greeting}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={sitePath(order.domain)} className={buttonVariants({ className: "h-11 px-5" })}>
            Open the site
          </Link>
          <Link href="/sites" className={buttonVariants({ variant: "outline", className: "h-11 px-5" })}>
            All published sites
          </Link>
        </div>
      </main>
    </Shell>
  )
}
