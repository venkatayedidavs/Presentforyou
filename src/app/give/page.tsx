import { GiveWizard } from "@/components/give-wizard"
import { Shell } from "@/components/site-frame"
import { GREETING_SITE_ID, getOffering } from "@/lib/catalog"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Start a gift",
}

export default function GivePage() {
  const offering = getOffering(GREETING_SITE_ID)
  if (!offering) notFound()

  return (
    <Shell>
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <GiveWizard offering={offering} />
      </main>
    </Shell>
  )
}
