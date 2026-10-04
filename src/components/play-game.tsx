"use client"

import type { GameId } from "@/lib/catalog"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

function useFinish(onComplete: () => void) {
  const sent = useRef(false)
  return useCallback(() => {
    if (sent.current) return
    sent.current = true
    onComplete()
  }, [onComplete])
}

function Board({
  title,
  hint,
  children,
}: {
  title: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-[#f7f3ea] p-4 sm:p-6">
      <h3 className="font-serif text-2xl text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      <div className="mt-5">{children}</div>
    </div>
  )
}

function BalloonPop({
  name,
  onComplete,
}: {
  name: string
  onComplete: () => void
}) {
  const finish = useFinish(onComplete)
  const [popped, setPopped] = useState<boolean[]>(() => Array(8).fill(false))
  const count = popped.filter(Boolean).length

  function pop(index: number) {
    setPopped((current) => {
      if (current[index]) return current
      const next = current.slice()
      next[index] = true
      return next
    })
  }

  useEffect(() => {
    if (popped.every(Boolean)) finish()
  }, [popped, finish])

  return (
    <Board title={`Balloons for ${name}`} hint={`${count} of 8 popped.`}>
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {popped.map((done, index) => (
          <button
            key={index}
            type="button"
            onClick={() => pop(index)}
            aria-pressed={done}
            className={`flex h-20 items-end justify-center rounded-full border text-xs font-medium transition sm:h-24 ${
              done
                ? "border-dashed border-border bg-transparent text-muted-foreground"
                : "border-transparent bg-[#b85c38] text-white shadow-sm hover:bg-[#9d4c2e]"
            }`}
          >
            {done ? "pop" : name.slice(0, 1).toUpperCase()}
          </button>
        ))}
      </div>
    </Board>
  )
}

function CandleCount({
  name,
  onComplete,
}: {
  name: string
  onComplete: () => void
}) {
  const finish = useFinish(onComplete)
  const [lit, setLit] = useState<boolean[]>(() => Array(7).fill(false))
  const count = lit.filter(Boolean).length

  function toggle(index: number) {
    setLit((current) => {
      const next = current.slice()
      next[index] = !next[index]
      return next
    })
  }

  useEffect(() => {
    if (lit.filter(Boolean).length === 5) finish()
  }, [lit, finish])

  return (
    <Board title={`Light five candles for ${name}`} hint={`${count} lit. Five finishes the game.`}>
      <div className="flex flex-wrap gap-3">
        {lit.map((on, index) => (
          <button
            key={index}
            type="button"
            onClick={() => toggle(index)}
            aria-pressed={on}
            className={`flex h-24 w-12 flex-col items-center justify-end rounded-t-full border pb-2 ${
              on ? "border-[#b85c38] bg-[#f3d7b0]" : "border-border bg-white"
            }`}
          >
            <span
              className={`mb-1 size-3 rounded-full ${on ? "bg-[#e07a3d]" : "bg-transparent"}`}
              aria-hidden
            />
            <span className="text-xs">{index + 1}</span>
          </button>
        ))}
      </div>
    </Board>
  )
}

function lettersOf(name: string): string[] {
  const first = name.trim().split(/\s+/)[0] ?? ""
  const chars = [...first.toLowerCase()].filter((char) => /[a-z]/.test(char)).slice(0, 8)
  return chars.length > 0 ? chars : ["h", "i"]
}

function LetterCatch({
  name,
  onComplete,
}: {
  name: string
  onComplete: () => void
}) {
  const finish = useFinish(onComplete)
  const target = useMemo(() => lettersOf(name), [name])
  const pool = useMemo(() => {
    const decoys = ["q", "x", "z", "j", "v"].filter((letter) => !target.includes(letter))
    const mixed = [...target, ...decoys.slice(0, 3)]
    return mixed
      .map((letter, index) => ({ letter, index }))
      .sort((a, b) => ((a.letter.charCodeAt(0) + a.index * 7) % 11) - ((b.letter.charCodeAt(0) + b.index * 7) % 11))
  }, [target])
  const [progress, setProgress] = useState(0)
  const [note, setNote] = useState("")

  function tap(letter: string) {
    if (letter === target[progress]) {
      const next = progress + 1
      setProgress(next)
      setNote("")
      if (next === target.length) finish()
      return
    }
    setNote("Not that letter. Keep the order of the name.")
  }

  return (
    <Board title={`Spell ${target.join("")}`} hint="Tap the letters in order.">
      <p className="mb-4 font-serif text-3xl tracking-[0.3em] text-foreground">
        {target.map((letter, index) => (
          <span key={`${letter}-${index}`} className={index < progress ? "text-primary" : "text-muted-foreground"}>
            {index < progress ? letter : "·"}
          </span>
        ))}
      </p>
      <div className="flex flex-wrap gap-2">
        {pool.map((item) => (
          <button
            key={item.index}
            type="button"
            onClick={() => tap(item.letter)}
            className="size-12 rounded-lg border border-border bg-white text-lg uppercase hover:border-primary"
          >
            {item.letter}
          </button>
        ))}
      </div>
      {note ? <p className="mt-3 text-sm text-destructive">{note}</p> : null}
    </Board>
  )
}

const BAG_ITEMS = [
  { id: "pencil", label: "Pencil", belongs: true },
  { id: "notebook", label: "Notebook", belongs: true },
  { id: "lunch", label: "Lunch", belongs: true },
  { id: "bottle", label: "Water bottle", belongs: true },
  { id: "pillow", label: "Pillow", belongs: false },
  { id: "lamp", label: "Lamp", belongs: false },
]

function PackBag({ name, onComplete }: { name: string; onComplete: () => void }) {
  const finish = useFinish(onComplete)
  const [packed, setPacked] = useState<string[]>([])

  function toggle(id: string) {
    setPacked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  useEffect(() => {
    const wanted = BAG_ITEMS.filter((item) => item.belongs).map((item) => item.id)
    const exact =
      wanted.length > 0 &&
      wanted.every((item) => packed.includes(item)) &&
      packed.every((item) => wanted.includes(item))
    if (exact) finish()
  }, [packed, finish])

  return (
    <Board title={`Pack a bag for ${name}`} hint="Take the school things. Leave the rest.">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {BAG_ITEMS.map((item) => {
          const on = packed.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              aria-pressed={on}
              className={`rounded-xl border px-3 py-4 text-left text-sm ${
                on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white"
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </Board>
  )
}

const PAIRS = ["Sun", "Moon", "Leaf"]

function MemoryMatch({ name, onComplete }: { name: string; onComplete: () => void }) {
  const finish = useFinish(onComplete)
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

  useEffect(() => {
    if (open.length !== 2) return
    const [first, second] = open
    const same = cards[first].pair === cards[second].pair
    const timer = window.setTimeout(() => {
      if (same) {
        setMatched((current) => [...current, first, second])
      }
      setOpen([])
      setLock(false)
    }, 700)
    return () => window.clearTimeout(timer)
  }, [open, cards])

  useEffect(() => {
    if (matched.length > 0 && matched.length === cards.length) finish()
  }, [matched, cards.length, finish])

  function flip(index: number) {
    if (lock || open.includes(index) || matched.includes(index) || open.length === 2) return
    const next = [...open, index]
    setOpen(next)
    if (next.length === 2) setLock(true)
  }

  return (
    <Board title={`A matching game for ${name}`} hint="Find the three pairs.">
      <div className="grid grid-cols-3 gap-2">
        {cards.map((card, index) => {
          const faceUp = open.includes(index) || matched.includes(index)
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(index)}
              className={`h-20 rounded-xl border text-sm font-medium ${
                faceUp ? "border-primary bg-white" : "border-transparent bg-primary text-primary-foreground"
              }`}
            >
              {faceUp ? card.label : "•"}
            </button>
          )
        })}
      </div>
    </Board>
  )
}

const COLORS = [
  { id: "moss", className: "bg-[#1e4638]" },
  { id: "clay", className: "bg-[#b85c38]" },
  { id: "sand", className: "bg-[#e2c48d]" },
  { id: "sea", className: "bg-[#7ea0b0]" },
]

function ColorTiles({ name, onComplete }: { name: string; onComplete: () => void }) {
  const finish = useFinish(onComplete)
  const [color, setColor] = useState(0)
  const [cells, setCells] = useState<(number | null)[]>(() => Array(16).fill(null))

  function paint(index: number) {
    setCells((current) => {
      const next = current.slice()
      next[index] = color
      return next
    })
  }

  useEffect(() => {
    if (cells.every((cell) => cell !== null)) finish()
  }, [cells, finish])

  return (
    <Board title={`Color a board for ${name}`} hint="Pick a color, then fill every tile.">
      <div className="mb-4 flex gap-2">
        {COLORS.map((swatch, index) => (
          <button
            key={swatch.id}
            type="button"
            aria-label={swatch.id}
            aria-pressed={color === index}
            onClick={() => setColor(index)}
            className={`size-9 rounded-full ${swatch.className} ${
              color === index ? "ring-2 ring-foreground ring-offset-2" : ""
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cells.map((value, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Tile ${index + 1}`}
            onClick={() => paint(index)}
            className={`h-14 rounded-lg border border-border ${
              value === null ? "bg-white" : COLORS[value].className
            }`}
          />
        ))}
      </div>
    </Board>
  )
}

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
