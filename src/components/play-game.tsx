"use client"

import type { GameId } from "@/lib/catalog"
import { BalloonPop } from "@/components/games/balloon-pop"
import { CandleCount } from "@/components/games/candle-count"
import { ColorTiles } from "@/components/games/color-tiles"
import { LetterCatch } from "@/components/games/letter-catch"
import { MemoryMatch } from "@/components/games/memory-match"
import { PackBag } from "@/components/games/pack-bag"

export function PlayGame({
  gameId,
  recipientName,
  onComplete,
}: {
  gameId: GameId
  recipientName: string
  onComplete: () => void
}) {
  switch (gameId) {
    case "balloon-pop":
      return <BalloonPop name={recipientName} onComplete={onComplete} />
    case "candle-count":
      return <CandleCount name={recipientName} onComplete={onComplete} />
    case "letter-catch":
      return <LetterCatch name={recipientName} onComplete={onComplete} />
    case "pack-bag":
      return <PackBag name={recipientName} onComplete={onComplete} />
    case "memory-match":
      return <MemoryMatch name={recipientName} onComplete={onComplete} />
    case "color-tiles":
      return <ColorTiles name={recipientName} onComplete={onComplete} />
  }
}
