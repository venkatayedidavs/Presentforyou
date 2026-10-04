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
      <main className="mx-auto w-full max-w-2xl px-5 py-14">
        <p className="text-sm font-medium text-primary">Published</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">The site is up.</h1>
        <p className="mt-4 text-muted-foreground">
          {order.domain} is recorded as registered. The greeting site was created with no further step.
          A real registrar would point the domain at this site. Here, the mock registrar stores the
          registration and the site is served on this machine.
        </p>
        <dl className="mt-8 space-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Domain</dt>
            <dd className="font-medium">{order.domain}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Recorded price</dt>
            <dd>{formatPrice(priceCents(order.domain))} for one year, not charged</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Purpose</dt>
            <dd>{purpose?.label ?? order.purposeId}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Game</dt>
            <dd>{option?.name ?? order.gameId}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Greeting</dt>
            <dd>{order.greeting}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={sitePath(order.domain)} className={buttonVariants({ className: "h-11 px-5" })}>
            Open the site
          </Link>
          <Link
            href="/sites"
            className={buttonVariants({ variant: "outline", className: "h-11 px-5" })}
          >
            All sites on this machine
          </Link>
        </div>
      </main>
    </Shell>
  )
}
