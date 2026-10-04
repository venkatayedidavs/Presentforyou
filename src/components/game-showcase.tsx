"use client"

import { PlayGame } from "@/components/play-game"
import { GREETING_SITE_ID, getOffering, type GameId } from "@/lib/catalog"
import { useState } from "react"

const offering = getOffering(GREETING_SITE_ID)

const games =
  offering?.purposes.flatMap((purpose) =>
    purpose.options.map((option) => ({
      id: option.gameId,
      name: option.name,
      description: option.description,
      purpose: purpose.label,
    })),
  ) ?? []

export function GameShowcase() {
  const [gameId, setGameId] = useState<GameId>("balloon-pop")
  const active = games.find((game) => game.id === gameId) ?? games[0]

  if (!active) return null

  return (
    <div>
      <div className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-px sm:mx-0 sm:px-0" role="tablist" aria-label="Games">
        {games.map((game) => {
          const selected = game.id === active.id
          return (
            <button
              key={game.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setGameId(game.id)}
              className={`shrink-0 border-b-2 pb-3 text-sm ${
                selected ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground"
              }`}
            >
              {game.name}
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {active.purpose}. {active.description} This sample uses the name Mina.
      </p>
      <div className="mt-5">
        <PlayGame key={active.id} gameId={active.id} recipientName="Mina" onComplete={() => undefined} />
      </div>
    </div>
  )
}
