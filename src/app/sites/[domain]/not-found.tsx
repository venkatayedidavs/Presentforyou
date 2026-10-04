import { Shell } from "@/components/site-frame"
import Link from "next/link"

export default function SiteNotFound() {
  return (
    <Shell>
      <main className="mx-auto w-full max-w-xl px-5 py-20">
        <h1 className="font-serif text-4xl">No site on that domain</h1>
        <p className="mt-3 text-muted-foreground">
          Nothing has been published there on this machine.
        </p>
        <Link href="/give" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
          Give a domain
        </Link>
      </main>
    </Shell>
  )
}
