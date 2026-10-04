"use client"

import { isGameMuted, playClear, setGameMuted } from "@/components/games/audio"
import { useEffect, useRef, useState, type ReactNode } from "react"

export function useWin(ready: boolean, onComplete: () => void) {
  const onCompleteRef = useRef(onComplete)
  const sent = useRef(false)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!ready || sent.current) return
    sent.current = true
    playClear()
    const timer = window.setTimeout(() => onCompleteRef.current(), 700)
    return () => window.clearTimeout(timer)
  }, [ready])
}

function SpeakerIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 10 v4 h3 l5 4 V6 L7 10 H4 Z" strokeLinejoin="round" />
      {off ? (
        <path d="M16 10 l5 5 M21 10 l-5 5" strokeLinecap="round" />
      ) : (
        <path d="M16 9.5 a3.5 3.5 0 0 1 0 5 M18.5 7 a6.5 6.5 0 0 1 0 10" strokeLinecap="round" />
      )}
    </svg>
  )
}

export function GameStage({
  title,
  hint,
  progressLabel,
  progress,
  children,
}: {
  title: string
  hint: string
  progressLabel: string
  progress: number
  children: ReactNode
}) {
  const [muted, setMuted] = useState(() => isGameMuted())
  const width = Math.max(0, Math.min(1, progress)) * 100

  return (
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_50px_-36px_rgba(20,20,20,0.45)]">
        <div className="flex flex-wrap items-end justify-between gap-3 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h3 className="font-serif text-[1.65rem] leading-tight font-medium tracking-tight text-foreground">
              {title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-serif text-xl tabular-nums tracking-tight" aria-live="polite">
              {progressLabel}
            </p>
            <button
              type="button"
              className="gv-hit grid size-8 place-items-center rounded-full border border-border text-foreground"
              aria-pressed={muted}
              aria-label={muted ? "Unmute sound" : "Mute sound"}
              onClick={() =>
                setMuted((current) => {
                  const next = !current
                  setGameMuted(next)
                  return next
                })
              }
            >
              <SpeakerIcon off={muted} />
            </button>
          </div>
        </div>
        <div className="h-px bg-border">
          <div className="h-px bg-primary transition-[width] duration-300" style={{ width: `${width}%` }} />
        </div>
        <div className="relative">{children}</div>
      </div>
  )
}

export function WinBanner({
  show,
  title,
  text,
}: {
  show: boolean
  title: string
  text: string
}) {
  if (!show) return null
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-[#141210]/35 p-4">
      <div className="max-w-xs rounded-xl bg-card px-6 py-5 text-center shadow-lg">
        <p className="font-serif text-3xl font-medium tracking-tight">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}
