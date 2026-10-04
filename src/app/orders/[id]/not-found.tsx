import { Shell } from "@/components/site-frame"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"

export default function OrderNotFound() {
  return (
    <Shell>
      <main className="mx-auto w-full max-w-xl px-4 py-20 sm:px-6">
        <h1 className="font-serif text-4xl font-medium tracking-tight">That receipt is not here</h1>
        <p className="mt-3 leading-7 text-muted-foreground">It does not match a published site on this machine.</p>
        <Link href="/sites" className={buttonVariants({ className: "mt-6 inline-flex h-11 px-5" })}>
          Published sites
        </Link>
      </main>
    </Shell>
  )
}
