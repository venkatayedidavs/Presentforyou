"use client"

import { PlayGame } from "@/components/play-game"
import { isGameId, type GameId } from "@/lib/catalog"
import type { GiftPhoto } from "@/lib/store"
import { useCallback, useRef, useState } from "react"

export function GiftSite({
  domain,
  recipientName,
  greeting,
  gameId,
  gameName,
  photos,
}: {
  domain: string
  recipientName: string
  greeting: string
  gameId: string
  gameName: string
  photos: GiftPhoto[]
}) {
  const photosRef = useRef<HTMLElement>(null)
  const [played, setPlayed] = useState(false)
  const knownGame: GameId | null = isGameId(gameId) ? gameId : null

  const onComplete = useCallback(() => {
    setPlayed(true)
    photosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
      <p className="text-sm text-muted-foreground">{domain}</p>
      <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-foreground sm:text-5xl">
        {greeting}
      </h1>
      <p className="mt-4 text-muted-foreground">
        A short game for {recipientName}, then a few photos.
      </p>

      <section className="mt-10" aria-label={gameName}>
        {knownGame ? (
          <PlayGame gameId={knownGame} recipientName={recipientName} onComplete={onComplete} />
        ) : (
          <p className="rounded-xl border border-border p-4 text-sm">This game is not available.</p>
        )}
        {played ? (
          <p className="mt-4 text-sm text-primary">The game is done. The photos are below.</p>
        ) : null}
      </section>

      <section ref={photosRef} className="mt-12 scroll-mt-6" aria-label="Photos">
        <h2 className="font-serif text-3xl">Photos</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          These sit under the game. Sample pictures are stand-ins until a parent uploads their own.
        </p>
        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              {/* User uploads are data URLs; next/image cannot optimize them. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.src} alt={photo.alt} className="aspect-[4/3] w-full object-cover" />
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
