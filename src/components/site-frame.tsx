import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"
import Link from "next/link"
import type { ReactNode } from "react"

const links = [
  { href: "/#gift", label: "The gift" },
  { href: "/#games", label: "Games" },
  { href: "/sites", label: "Sites" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-foreground">
          <span className="grid size-7 place-items-center rounded-md bg-primary font-serif text-sm text-primary-foreground">
            G
          </span>
          <span className="font-serif text-[1.65rem] leading-none font-medium tracking-tight">Given</span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground",
                link.href !== "/sites" && "hidden sm:inline",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/give" className={cn(buttonVariants(), "ml-1 h-9 px-3.5 sm:ml-2")}>
            Start a gift
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-serif text-2xl font-medium tracking-tight">Given</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
            A domain, a greeting, a short game, and a few photos.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Shop</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <Link href="/give" className="hover:text-foreground">
                Start a gift
              </Link>
            </li>
            <li>
              <Link href="/sites" className="hover:text-foreground">
                Published sites
              </Link>
            </li>
            <li>
              <Link href="/#games" className="hover:text-foreground">
                Try the games
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">This version</p>
          <p className="mt-3 leading-6">
            Prices are recorded and no card is charged. The registrar is simulated. Given is owned by Venkata Yedida.
          </p>
        </div>
      </div>
    </footer>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </>
  )
}
