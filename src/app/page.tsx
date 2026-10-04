import { GameShowcase } from "@/components/game-showcase"
import { ProductPreview } from "@/components/product-preview"
import { Shell } from "@/components/site-frame"
import { buttonVariants } from "@/components/ui/button"
import { listOfferings } from "@/lib/catalog"
import { formatPrice, listedDomainPrices } from "@/lib/domain"
import { cn } from "cn"
import Link from "next/link"

const steps = [
  {
    title: "Choose a domain",
    text: "Search a name. Given checks it with the registrar, and you take one that is free.",
  },
  {
    title: "Say what it is for",
    text: "A birthday, a first day of school, or no occasion. Each purpose comes with its own games.",
  },
  {
    title: "Publish",
    text: "Checkout records the price and puts the site up. The greeting, the game, and the photos are already there.",
  },
]

const included = [
  { title: "Domain", text: "A .com, .site, or .fun, recorded for one year." },
  { title: "Greeting", text: "A short note at the top of the page, in your words." },
  { title: "Game", text: "One small game that uses their name." },
  { title: "Photographs", text: "Up to four pictures, placed under the game." },
]

export default function HomePage() {
  const offerings = listOfferings()
  const prices = listedDomainPrices()
  const from = Math.min(...prices.map((price) => price.cents))

  return (
    <Shell>
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 md:grid-cols-[1.05fr_0.95fr] md:py-24 lg:gap-20">
          <div>
            <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-primary uppercase">Greeting site</p>
            <h1 className="mt-4 font-serif text-[2.75rem] leading-[1.02] font-medium tracking-[-0.03em] text-foreground sm:text-6xl">
              Give them a domain.
              <span className="mt-1 block font-normal italic">The site is already there.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              A parent picks a name, writes a short greeting, chooses a small game, and adds a few photos. Given
              records the domain and publishes the site at checkout.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/give" className={buttonVariants({ size: "lg", className: "h-11 px-5" })}>
                Start a gift
              </Link>
              <Link
                href="/#games"
                className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 px-5" })}
              >
                Play a game
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              From {formatPrice(from)}. The price is recorded. No card is charged.
            </p>
          </div>
          <ProductPreview />
        </section>

        <section className="border-y border-border">
          <dl className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {included.map((item, index) => (
              <div key={item.title}>
                <dt className="text-[0.7rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  0{index + 1} {item.title}
                </dt>
                <dd className="mt-2 text-sm leading-6">{item.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="how" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">How it works</p>
            <h2 className="mt-3 max-w-xl font-serif text-4xl font-medium tracking-tight">
              Three steps, then the site is up.
            </h2>
            <ol className="mt-10 grid gap-10 md:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className="border-t border-border pt-5">
                  <p className="text-sm tabular-nums text-muted-foreground">0{index + 1}</p>
                  <h3 className="mt-3 font-serif text-2xl font-medium tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="gift" className="scroll-mt-20 border-t border-border">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:py-20">
            <div>
              <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                What you can give
              </p>
              {offerings.map((offering) => (
                <div key={offering.id} className="mt-3">
                  <h2 className="font-serif text-4xl font-medium tracking-tight">{offering.name}</h2>
                  <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">{offering.summary}</p>
                  <p className="mt-4 max-w-xl text-sm leading-7">{offering.detail}</p>
                  <Link href="/give" className={cn(buttonVariants(), "mt-8 inline-flex h-11 px-5")}>
                    Give this site
                  </Link>
                </div>
              ))}
            </div>
            <div className="border border-border bg-card p-6 sm:p-8">
              <p className="text-sm font-medium">Recorded for one year</p>
              <ul className="mt-4 divide-y divide-border">
                {prices.map((price) => (
                  <li key={price.tld} className="flex items-baseline justify-between py-3">
                    <span className="text-sm text-muted-foreground">.{price.tld}</span>
                    <span className="font-serif text-2xl tabular-nums">{formatPrice(price.cents)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Checkout writes the price down. It does not charge a card. Version 1 sells this one gift, so a later
                gift can be added to the catalog without a second shop.
              </p>
            </div>
          </div>
        </section>

        <section id="games" className="scroll-mt-20 border-t border-border bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">The games</p>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl font-medium tracking-tight">
              A short game, made with their name.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
              The published site includes the one you choose. Play them here first. On the real page, finishing the
              game brings the photographs up.
            </p>
            <div className="mt-8">
              <GameShowcase />
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-end">
            <div>
              <h2 className="font-serif text-4xl font-medium tracking-tight">Give the site.</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                Domain registration in this version is simulated, so the whole gift can be finished on this computer.
              </p>
            </div>
            <Link href="/give" className={buttonVariants({ size: "lg", className: "h-11 px-5" })}>
              Start a gift
            </Link>
          </div>
        </section>
      </main>
    </Shell>
  )
}
