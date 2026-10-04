import Link from "next/link"
import type { ReactNode } from "react"

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-serif text-2xl tracking-tight text-foreground">
          Given
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/give" className="font-medium text-foreground hover:underline">
            Give
          </Link>
          <Link href="/sites" className="text-muted-foreground hover:text-foreground">
            Sites
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Given is owned by Venkata Yedida.</p>
        <p>Version 1 records domains with a mock registrar.</p>
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
