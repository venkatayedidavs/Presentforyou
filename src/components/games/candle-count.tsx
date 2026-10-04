"use client"

import { playMiss, playTick } from "@/components/games/audio"
import { GameStage, useWin, WinBanner } from "@/components/games/stage"
import { useState } from "react"

export function CandleCount({ name, onComplete }: { name: string; onComplete: () => void }) {
  const [lit, setLit] = useState<boolean[]>(() => Array(7).fill(false))
  const count = lit.filter(Boolean).length
  const clear = count === 5
  useWin(clear, onComplete)

  function toggle(index: number) {
    setLit((current) => {
      const next = current.slice()
      next[index] = !next[index]
      return next
    })
    const turningOn = !lit[index]
    if (turningOn && count === 4) return
    if (turningOn) playTick()
    else playMiss()
  }

  const glow = 0.05 + count * 0.06

  return (
    <GameStage
      title={`Light five candles for ${name}`}
      hint={count === 5 ? "Five candles. That is the one." : "Seven candles. Light exactly five."}
      progressLabel={`${count} lit`}
      progress={Math.min(count, 5) / 5}
    >
      <div
        className="relative overflow-hidden px-4 pt-8 pb-10"
        style={{
          background: `radial-gradient(55% 45% at 50% 62%, rgba(240, 168, 90, ${glow}), transparent 70%), #141210`,
        }}
      >
        <div className="mx-auto flex max-w-lg items-end justify-center gap-2 sm:gap-4">
          {lit.map((on, index) => (
            <button
              key={index}
              type="button"
              onClick={() => toggle(index)}
              aria-pressed={on}
              aria-label={`Candle ${index + 1}${on ? ", lit" : ""}`}
              className="gv-hit flex w-8 flex-col items-center sm:w-10"
            >
              <span className={on ? "gv-flame" : "h-[18px] w-[11px]"} />
              <span className="relative mt-0.5 h-16 w-2.5 rounded-sm bg-gradient-to-b from-[#fffaf3] to-[#eadcc4] shadow-[0_8px_16px_-10px_rgba(0,0,0,0.8)]">
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-medium text-[#8d7360]">
                  {index + 1}
                </span>
              </span>
            </button>
          ))}
        </div>
        <div className="relative z-10 mx-auto -mt-2 max-w-md">
          <div className="h-5 rounded-t-[50%] bg-[#f6f1e8]" />
          <div className="relative h-16 bg-[#f7f3ec]">
            <div className="absolute inset-x-3 top-1/2 h-3 -translate-y-1/2 bg-[#1f3d34]" />
          </div>
          <div className="h-7 rounded-b-[1.4rem] bg-[#e4c48a]" />
          <div className="mx-auto mt-5 h-3 max-w-lg rounded-full bg-[#3a312a]" />
        </div>
        <WinBanner show={clear} title="Five candles" text={`Lit for ${name}.`} />
      </div>
    </GameStage>
  )
}
