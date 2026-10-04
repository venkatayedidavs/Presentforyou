import { Shell } from "@/components/site-frame"
import Link from "next/link"

export default function OrderNotFound() {
  return (
    <Shell>
      <main className="mx-auto w-full max-w-xl px-5 py-20">
        <h1 className="font-serif text-4xl">That gift is not here</h1>
        <p className="mt-3 text-muted-foreground">The receipt does not match a published site on this machine.</p>
        <Link href="/sites" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
          See published sites
        </Link>
      </main>
    </Shell>
  )
}
