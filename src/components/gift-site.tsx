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
    <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">{domain}</p>
      <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.12] font-medium tracking-tight text-foreground sm:text-6xl">
        {greeting}
      </h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
        A game for {recipientName}, then a few photographs.
      </p>

      <section className="mt-12" aria-label={gameName}>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-3xl font-medium tracking-tight">{gameName}</h2>
          <p className="text-sm text-muted-foreground">Finish the game and the photographs follow.</p>
        </div>
        {knownGame ? (
          <PlayGame gameId={knownGame} recipientName={recipientName} onComplete={onComplete} />
        ) : (
          <p className="rounded-xl border border-border p-4 text-sm">This game is not available.</p>
        )}
        {played ? (
          <p className="mt-4 text-sm text-primary">Done. The photographs are below.</p>
        ) : null}
      </section>

      <section ref={photosRef} className="mt-16 scroll-mt-24" aria-label="Photos">
        <h2 className="font-serif text-3xl font-medium tracking-tight">Photographs</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          They sit under the game. The sample set is three illustrations, until a parent uploads their own.
        </p>
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.id}>
              <figure className="overflow-hidden">
                {/* User uploads are data URLs; next/image cannot optimize them. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="aspect-[4/3] w-full rounded-lg border border-border object-cover"
                />
                <figcaption className="mt-2 text-sm text-muted-foreground">{photo.alt}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
