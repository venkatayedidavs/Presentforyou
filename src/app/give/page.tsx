import { GiveWizard } from "@/components/give-wizard"
import { Shell } from "@/components/site-frame"
import { GREETING_SITE_ID, getOffering } from "@/lib/catalog"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Give a domain",
}

export default function GivePage() {
  const offering = getOffering(GREETING_SITE_ID)
  if (!offering) notFound()

  return (
    <Shell>
      <main className="mx-auto w-full max-w-3xl px-5 py-10">
        <GiveWizard offering={offering} />
      </main>
    </Shell>
  )
}
