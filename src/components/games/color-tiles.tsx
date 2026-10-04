"use client"

import { playTick } from "@/components/games/audio"
import { GameStage, useWin, WinBanner } from "@/components/games/stage"
import { useState } from "react"

const COLORS = [
  { id: "moss", name: "Moss", fill: "#1f3d34" },
  { id: "clay", name: "Clay", fill: "#8c4a3a" },
  { id: "sand", name: "Sand", fill: "#e4c48a" },
  { id: "sea", name: "Sea", fill: "#6e92a3" },
]

export function ColorTiles({ name, onComplete }: { name: string; onComplete: () => void }) {
  const [color, setColor] = useState(0)
  const [cells, setCells] = useState<(number | null)[]>(() => Array(16).fill(null))
  const filled = cells.filter((cell) => cell !== null).length
  const clear = cells.every((cell) => cell !== null)
  useWin(clear, onComplete)

  function paint(index: number) {
    setCells((current) => {
      if (current[index] === color) return current
      const next = current.slice()
      next[index] = color
      return next
    })
    if (cells[index] !== color && filled + (cells[index] === null ? 1 : 0) < 16) playTick()
  }

  return (
    <GameStage
      title={`Color a board for ${name}`}
      hint="Pick a glaze, then fill every tile."
      progressLabel={`${filled} of 16`}
      progress={filled / 16}
    >
      <div className="relative bg-[#eceae6] px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap gap-2">
          {COLORS.map((swatch, index) => {
            const on = color === index
            return (
              <button
                key={swatch.id}
                type="button"
                aria-label={swatch.id}
                aria-pressed={on}
                onClick={() => setColor(index)}
                className={`gv-hit flex items-center gap-2 rounded-full border py-1.5 pr-3 pl-1.5 text-sm ${
                  on ? "border-foreground bg-card" : "border-transparent bg-card/70"
                }`}
              >
                <span className="size-6 rounded-full" style={{ background: swatch.fill }} />
                {swatch.name}
              </button>
            )
          })}
        </div>
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2 rounded-xl bg-[#2a2724] p-3">
          {cells.map((value, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Tile ${index + 1}`}
              onClick={() => paint(index)}
              className="gv-hit h-14 rounded-sm border border-white/10 sm:h-16"
              style={{ background: value === null ? "#f7f4ef" : COLORS[value].fill }}
            />
          ))}
        </div>
        <WinBanner show={clear} title="Filled" text={`A board for ${name}.`} />
      </div>
    </GameStage>
  )
}
