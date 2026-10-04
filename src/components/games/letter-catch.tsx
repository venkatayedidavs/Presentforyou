"use client"

import { playMiss, playTick } from "@/components/games/audio"
import { GameStage, useWin, WinBanner } from "@/components/games/stage"
import { useMemo, useState } from "react"

function lettersOf(name: string): string[] {
  const first = name.trim().split(/\s+/)[0] ?? ""
  const chars = [...first.toLowerCase()].filter((char) => /[a-z]/.test(char)).slice(0, 8)
  return chars.length > 0 ? chars : ["h", "i"]
}

export function LetterCatch({ name, onComplete }: { name: string; onComplete: () => void }) {
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
  const [shake, setShake] = useState(false)
  const clear = progress === target.length
  useWin(clear, onComplete)
  const titleWord = target.join("")
  const titled = titleWord.charAt(0).toUpperCase() + titleWord.slice(1)

  function tap(letter: string) {
    if (clear) return
    if (letter === target[progress]) {
      setProgress((current) => current + 1)
      setNote("")
      if (progress + 1 !== target.length) playTick()
      return
    }
    setNote("Not that letter. Keep the order of the name.")
    setShake(true)
    window.setTimeout(() => setShake(false), 360)
    playMiss()
  }

  return (
    <GameStage
      title={`Spell ${titled}`}
      hint="Tap the letters in order."
      progressLabel={`${progress} of ${target.length}`}
      progress={target.length === 0 ? 0 : progress / target.length}
    >
      <div className={`relative bg-[#f4efe6] px-4 py-8 sm:px-8 ${shake ? "gv-shake" : ""}`}>
        <div className="flex flex-wrap justify-center gap-2">
          {target.map((letter, index) => {
            const filled = index < progress
            return (
              <span
                key={`${letter}-${index}`}
                className={`grid h-14 w-11 place-items-center border-b-2 font-serif text-3xl ${
                  filled ? "border-primary text-foreground" : "border-[#ddd4c6] text-[#ddd4c6]"
                }`}
              >
                {filled ? letter.toUpperCase() : ""}
              </span>
            )
          })}
        </div>
        <div className="mx-auto mt-8 flex max-w-md flex-wrap justify-center gap-2">
          {pool.map((item) => (
            <button
              key={item.index}
              type="button"
              onClick={() => tap(item.letter)}
              className="gv-hit h-14 min-w-12 rounded-md border border-[#e4d8c4] bg-[#fbf7ef] px-3 font-serif text-xl uppercase shadow-[0_2px_0_#e0d3bf] active:translate-y-px active:shadow-none"
            >
              {item.letter}
            </button>
          ))}
        </div>
        <p className="mt-5 min-h-5 text-center text-sm text-destructive" role="alert">
          {note}
        </p>
        <WinBanner show={clear} title={titled} text="Spelled in order." />
      </div>
    </GameStage>
  )
}
