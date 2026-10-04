"use client"

import { playPop } from "@/components/games/audio"
import { BALLOON_LOOKS, BalloonArt } from "@/components/games/balloon-art"
import { GameStage, useWin, WinBanner } from "@/components/games/stage"
import { useId, useState } from "react"

const SPOTS = [
  { left: "4%", top: "7%" },
  { left: "27%", top: "14%" },
  { left: "49%", top: "5%" },
  { left: "71%", top: "13%" },
  { left: "10%", top: "46%" },
  { left: "33%", top: "40%" },
  { left: "55%", top: "48%" },
  { left: "74%", top: "38%" },
]

const SPARKS = [
  ["-28px", "-36px"],
  ["24px", "-32px"],
  ["-36px", "6px"],
  ["32px", "8px"],
  ["-8px", "-44px"],
  ["12px", "28px"],
]

export function BalloonPop({ name, onComplete }: { name: string; onComplete: () => void }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
  const [popped, setPopped] = useState<boolean[]>(() => Array(8).fill(false))
  const count = popped.filter(Boolean).length
  const clear = popped.every(Boolean)
  useWin(clear, onComplete)
  const letter = (name.trim()[0] ?? "G").toUpperCase()

  function pop(index: number) {
    setPopped((current) => {
      if (current[index]) return current
      const next = current.slice()
      next[index] = true
      return next
    })
    if (!popped[index]) playPop()
  }

  return (
    <GameStage
      title={`Balloons for ${name}`}
      hint="Pop every balloon."
      progressLabel={`${count} of 8`}
      progress={count / 8}
    >
      <div className="gv-sky relative h-[28rem] overflow-hidden sm:h-[32rem]">
        <div className="gv-cloud w-24" style={{ top: "12%", left: "8%" }} />
        <div className="gv-cloud w-16" style={{ top: "22%", left: "62%" }} />
        <div className="gv-hill-far" />
        <div className="gv-hill" />
        {popped.map((done, index) => {
          const look = BALLOON_LOOKS[index]
          return (
            <button
              key={index}
              type="button"
              onClick={() => pop(index)}
              aria-pressed={done}
              aria-label={done ? `Popped balloon ${index + 1}` : `Pop balloon ${index + 1}`}
              className={`gv-hit absolute w-[3.25rem] sm:w-[4.75rem] ${done ? "" : "gv-bob"}`}
              style={{
                left: SPOTS[index].left,
                top: SPOTS[index].top,
                animationDelay: `${index * 0.35}s`,
                animationDuration: `${4.8 + (index % 3) * 0.6}s`,
                zIndex: index + 1,
              }}
            >
              {done ? (
                <span className="relative block aspect-[100/150] w-full">
                  {SPARKS.map(([dx, dy], spark) => (
                    <span
                      key={spark}
                      className="gv-spark"
                      style={{ ["--dx" as string]: dx, ["--dy" as string]: dy, ["--spark" as string]: look.color }}
                    />
                  ))}
                </span>
              ) : (
                <BalloonArt
                  color={look.color}
                  shade={look.shade}
                  highlight={look.highlight}
                  letter={letter}
                  gradientId={`${uid}-b${index}`}
                />
              )}
            </button>
          )
        })}
        <WinBanner show={clear} title="All popped" text={`Every balloon for ${name} is gone.`} />
      </div>
    </GameStage>
  )
}
