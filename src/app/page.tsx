import { Shell } from "@/components/site-frame"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { listOfferings } from "@/lib/catalog"
import Link from "next/link"

const steps = [
  {
    title: "Choose a domain",
    text: "Search a name. Given checks it with the registrar and you pick one that is free.",
  },
  {
    title: "Say what it is for",
    text: "Pick a purpose, then one of the options that purpose offers. Version 1 options are short games.",
  },
  {
    title: "The site goes up",
    text: "Checkout records the domain and publishes the greeting, the game, and the photos. No extra step.",
  },
]

export default function HomePage() {
  const offerings = listOfferings()

  return (
    <Shell>
      <main>
        <section className="mx-auto grid max-w-5xl items-center gap-12 px-5 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
          <div>
            <p className="text-sm font-medium tracking-wide text-primary">A domain, given</p>
            <h1 className="mt-3 font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              Give someone a domain, and a site that is already there.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Given is the desk in the middle. You choose the name and the gift. We register the
              domain and publish a small site on it.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/give" className={buttonVariants({ size: "lg", className: "h-11 px-5" })}>
                Start a gift
              </Link>
              <Link
                href="/sites"
                className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 px-5" })}
              >
                Sites on this machine
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-3 shadow-sm">
            <div className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-[#b85c38]" />
              <span>hello-mina.site</span>
            </div>
            <div className="rounded-2xl bg-[#f7f3ea] px-5 py-8">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Greeting site</p>
              <p className="mt-3 font-serif text-3xl leading-tight">
                Mina, this domain is yours. Happy birthday.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">A game, then three photos.</p>
            </div>
          </div>
        </section>

        <section className="border-y border-border">
          <ol className="mx-auto grid max-w-5xl gap-8 px-5 py-14 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <p className="font-serif text-3xl text-primary">{index + 1}</p>
                <h2 className="mt-2 font-serif text-2xl">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16">
          <h2 className="font-serif text-3xl">What you can give</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            The shop is a catalog. Version 1 has one gift. Another gift later is another entry, not a new store.
          </p>
          <div className="mt-8 grid gap-4">
            {offerings.map((offering) => (
              <Card key={offering.id}>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">{offering.name}</CardTitle>
                  <CardDescription>{offering.summary}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6">{offering.detail}</p>
                  <Link href="/give" className={buttonVariants({ className: "h-11 w-fit px-5" })}>
                    Give this site
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
            Domain registration in this version is simulated, so the whole gift can be finished on
            this computer. The price is recorded and is not charged.
          </p>
        </section>
      </main>
    </Shell>
  )
}
