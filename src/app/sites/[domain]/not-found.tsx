import { Shell } from "@/components/site-frame"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"

export default function SiteNotFound() {
  return (
    <Shell>
      <main className="mx-auto w-full max-w-xl px-4 py-20 sm:px-6">
        <h1 className="font-serif text-4xl font-medium tracking-tight">No site on that domain</h1>
        <p className="mt-3 leading-7 text-muted-foreground">Nothing has been published there on this machine.</p>
        <Link href="/give" className={buttonVariants({ className: "mt-6 inline-flex h-11 px-5" })}>
          Start a gift
        </Link>
      </main>
    </Shell>
  )
}
