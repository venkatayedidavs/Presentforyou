import { Shell } from "@/components/site-frame"
import { buttonVariants } from "@/components/ui/button"
import { getOffering } from "@/lib/catalog"
import { listOrders, sitePath } from "@/lib/orders"
import { cn } from "cn"
import type { Metadata } from "next"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export const metadata: Metadata = {
  title: "Sites",
}

export default async function SitesPage() {
  const orders = await listOrders()

  return (
    <Shell>
      <main className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
        <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">On this machine</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">Published sites</h1>
        <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
          Each one went up at checkout. The domain is stored as registered by the mock registrar.
        </p>
        {orders.length === 0 ? (
          <div className="mt-10 border border-dashed border-border px-6 py-12">
            <p className="font-medium">No sites yet.</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Start a gift and publish it. It will be listed here.
            </p>
            <Link href="/give" className={cn(buttonVariants(), "mt-6 inline-flex h-11 px-5")}>
              Start a gift
            </Link>
          </div>
        ) : (
          <ul className="mt-10 divide-y divide-border border-y border-border">
            {orders.map((order) => {
              const offering = getOffering(order.offeringId)
              const purpose = offering?.purposes.find((item) => item.id === order.purposeId)
              return (
                <li key={order.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link href={sitePath(order.domain)} className="font-medium hover:underline">
                      {order.domain}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {order.recipientName} · {purpose?.label ?? order.purposeId}
                    </p>
                  </div>
                  <Link href={`/orders/${order.id}`} className="text-sm text-muted-foreground hover:text-foreground">
                    Receipt
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </Shell>
  )
}
