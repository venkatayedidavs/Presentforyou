"use client"

import { playMiss, playTick } from "@/components/games/audio"
import { GameStage, useWin, WinBanner } from "@/components/games/stage"
import { useEffect, useMemo, useState } from "react"

const PAIRS = ["Sun", "Moon", "Leaf"] as const

function Glyph({ label }: { label: string }) {
  const common = {
    viewBox: "0 0 48 48",
    className: "size-8",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    "aria-hidden": true as const,
  }
  if (label === "Sun") {
    return (
      <svg {...common}>
        <circle cx="24" cy="24" r="7" />
        <path d="M24 8 v5 M24 35 v5 M8 24 h5 M35 24 h5 M12 12 l3.5 3.5 M32.5 32.5 L36 36 M36 12 l-3.5 3.5 M15.5 32.5 L12 36" strokeLinecap="round" />
      </svg>
    )
  }
  if (label === "Moon") {
    return (
      <svg {...common}>
        <path d="M28 10 a14 14 0 1 0 0 28 a10 10 0 1 1 0 -28 Z" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M24 40 C24 40 10 28 10 18 a8 8 0 0 1 14 -5 a8 8 0 0 1 14 5 C38 28 24 40 24 40 Z" strokeLinejoin="round" />
      <path d="M24 16 v16" />
    </svg>
  )
}

export function MemoryMatch({ name, onComplete }: { name: string; onComplete: () => void }) {
  const cards = useMemo(() => {
    const deck = PAIRS.flatMap((label, pair) => [
      { id: `${label}-a`, label, pair },
      { id: `${label}-b`, label, pair },
    ])
    return [1, 4, 0, 5, 2, 3].map((index) => deck[index])
  }, [])
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [lock, setLock] = useState(false)
  const pairs = matched.length / 2
  const clear = matched.length > 0 && matched.length === cards.length
  useWin(clear, onComplete)

  useEffect(() => {
    if (open.length !== 2) return
    const [first, second] = open
    const same = cards[first].pair === cards[second].pair
    const willClear = same && matched.length + 2 === cards.length
    if (!willClear) {
      if (same) playTick()
      else playMiss()
    }
    const timer = window.setTimeout(() => {
      if (same) setMatched((current) => [...current, first, second])
      setOpen([])
      setLock(false)
    }, 700)
    return () => window.clearTimeout(timer)
  }, [open, cards, matched.length])

  function flip(index: number) {
    if (lock || open.includes(index) || matched.includes(index) || open.length === 2) return
    const next = [...open, index]
    setOpen(next)
    if (next.length === 2) setLock(true)
  }

  return (
    <GameStage
      title={`A matching game for ${name}`}
      hint="Find the three pairs."
      progressLabel={`${pairs} of 3`}
      progress={pairs / 3}
    >
      <div className="gv-felt relative px-4 py-8 sm:px-8">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
          {cards.map((card, index) => {
            const faceUp = open.includes(index) || matched.includes(index)
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => flip(index)}
                aria-label={faceUp ? card.label : `Face-down card ${index + 1}`}
                aria-pressed={faceUp}
                className="gv-card gv-hit h-28 sm:h-32"
              >
                <span className={`gv-card-inner ${faceUp ? "is-flipped" : ""}`}>
                  <span className="gv-face gv-face-back">
                    <span className="font-serif text-lg text-[#f4efe4]/80">G</span>
                  </span>
                  <span className="gv-face gv-face-front flex-col gap-1">
                    <Glyph label={card.label} />
                    <span className="text-xs font-medium tracking-wide uppercase">{card.label}</span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        <WinBanner show={clear} title="Three pairs" text={`Matched for ${name}.`} />
      </div>
    </GameStage>
  )
}
