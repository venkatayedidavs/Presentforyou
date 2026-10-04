"use client"

import { playMiss, playTick } from "@/components/games/audio"
import { GameStage, useWin, WinBanner } from "@/components/games/stage"
import { useState } from "react"

const BAG_ITEMS = [
  { id: "pencil", label: "Pencil", belongs: true },
  { id: "notebook", label: "Notebook", belongs: true },
  { id: "lunch", label: "Lunch", belongs: true },
  { id: "bottle", label: "Water bottle", belongs: true },
  { id: "pillow", label: "Pillow", belongs: false },
  { id: "lamp", label: "Lamp", belongs: false },
]

function ItemIcon({ id }: { id: string }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "size-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    "aria-hidden": true as const,
  }
  if (id === "pencil") {
    return (
      <svg {...common}>
        <path d="M4 20 l4 -1 L19 8 l-3 -3 L5 16 Z" strokeLinejoin="round" />
        <path d="M14 6 l3 3" />
      </svg>
    )
  }
  if (id === "notebook") {
    return (
      <svg {...common}>
        <rect x="6" y="3" width="13" height="18" rx="1.5" />
        <path d="M9 3 v18 M12 8 h4 M12 12 h4" />
      </svg>
    )
  }
  if (id === "lunch") {
    return (
      <svg {...common}>
        <rect x="3" y="8" width="18" height="11" rx="2" />
        <path d="M8 8 V6 a4 4 0 0 1 8 0 v2" />
      </svg>
    )
  }
  if (id === "bottle") {
    return (
      <svg {...common}>
        <path d="M10 3 h4 v3 l2 2 v12 a2 2 0 0 1 -2 2 h-4 a2 2 0 0 1 -2 -2 V8 l2 -2 Z" strokeLinejoin="round" />
      </svg>
    )
  }
  if (id === "pillow") {
    return (
      <svg {...common}>
        <rect x="3" y="7" width="18" height="11" rx="4" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M9 21 h6 M12 21 V10" />
      <path d="M8 10 h8 l-1 4 H9 Z" strokeLinejoin="round" />
    </svg>
  )
}

export function PackBag({ name, onComplete }: { name: string; onComplete: () => void }) {
  const [packed, setPacked] = useState<string[]>([])
  const wanted = BAG_ITEMS.filter((item) => item.belongs).map((item) => item.id)
  const exact =
    wanted.every((item) => packed.includes(item)) && packed.every((item) => wanted.includes(item))
  useWin(exact, onComplete)
  const schoolCount = packed.filter((id) => wanted.includes(id)).length

  function toggle(id: string) {
    const adding = !packed.includes(id)
    setPacked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
    const item = BAG_ITEMS.find((entry) => entry.id === id)
    const schoolIds = BAG_ITEMS.filter((entry) => entry.belongs).map((entry) => entry.id)
    const nextPacked = packed.includes(id) ? packed.filter((entry) => entry !== id) : [...packed, id]
    const nextExact =
      schoolIds.every((entry) => nextPacked.includes(entry)) &&
      nextPacked.every((entry) => schoolIds.includes(entry))
    if (nextExact) return
    if (adding && item && !item.belongs) playMiss()
    else playTick()
  }

  return (
    <GameStage
      title={`Pack a bag for ${name}`}
      hint="Take the school things. Leave the rest."
      progressLabel={`${schoolCount} of 4`}
      progress={schoolCount / 4}
    >
      <div className="relative grid gap-0 bg-[#f6f4f0] md:grid-cols-[1.15fr_0.85fr]">
        <ul className="divide-y divide-border border-b border-border md:border-r md:border-b-0">
          {BAG_ITEMS.map((item) => {
            const on = packed.includes(item.id)
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-pressed={on}
                  className="gv-hit flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5"
                >
                  <span
                    className={`grid size-10 place-items-center rounded-lg border ${
                      on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
                    }`}
                  >
                    <ItemIcon id={item.id} />
                  </span>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  <span className="text-xs tracking-wide text-muted-foreground uppercase">
                    {on ? "Packed" : "Add"}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <div className="flex flex-col items-center justify-center px-6 py-8">
          <svg viewBox="0 0 200 230" className="w-40" aria-hidden>
            <path d="M72 46 Q100 16 128 46" fill="none" stroke="#1c1915" strokeWidth="6" strokeLinecap="round" />
            <rect x="38" y="50" width="124" height="150" rx="28" fill="#1f3d34" />
            <rect x="58" y="112" width="84" height="62" rx="12" fill="#2c5348" />
            <path d="M70 78 h60" stroke="#f4efe6" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          </svg>
          <p className="mt-4 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">In the bag</p>
          <ul className="mt-2 min-h-16 text-center text-sm leading-6">
            {packed.length === 0 ? (
              <li className="text-muted-foreground">Nothing yet.</li>
            ) : (
              packed.map((id) => {
                const item = BAG_ITEMS.find((entry) => entry.id === id)
                return (
                  <li key={id} className={item?.belongs ? "text-foreground" : "text-destructive"}>
                    {item?.label}
                  </li>
                )
              })
            )}
          </ul>
        </div>
        <WinBanner show={exact} title="Packed" text={`The bag is ready for ${name}.`} />
      </div>
    </GameStage>
  )
}
