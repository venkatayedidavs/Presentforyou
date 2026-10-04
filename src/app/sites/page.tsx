import { Shell } from "@/components/site-frame"
import { getOffering } from "@/lib/catalog"
import { listOrders, sitePath } from "@/lib/orders"
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
      <main className="mx-auto w-full max-w-3xl px-5 py-14">
        <h1 className="font-serif text-4xl tracking-tight">Sites on this machine</h1>
        <p className="mt-3 text-muted-foreground">
          Each one was published after checkout. The domain is stored as registered by the mock registrar.
        </p>
        {orders.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border px-5 py-10">
            <p className="font-medium">No sites yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Start a gift and publish it. It will show up here.
            </p>
            <Link href="/give" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
              Give a domain
            </Link>
          </div>
        ) : (
          <ul className="mt-8 divide-y divide-border rounded-2xl border border-border">
            {orders.map((order) => {
              const offering = getOffering(order.offeringId)
              const purpose = offering?.purposes.find((item) => item.id === order.purposeId)
              return (
                <li key={order.id} className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
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
