"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { renderGreeting, type Offering } from "@/lib/catalog"
import { formatPrice } from "@/lib/domain"
import type { Availability } from "@/lib/registrar"
import { cn } from "cn"
import { useRouter } from "next/navigation"
import { useState } from "react"

const STEPS = ["Domain", "Purpose", "Game", "Greeting", "Publish"] as const

const STEP_COPY = [
  {
    title: "Choose a domain",
    text: "Search a name. Given asks the registrar which of these are free.",
  },
  {
    title: "Choose a purpose",
    text: "The purpose sets the greeting and which games are offered.",
  },
  {
    title: "Choose a game",
    text: "One short game, made with their name.",
  },
  {
    title: "Write the greeting",
    text: "The note sits at the top of the site. Photos sit under the game.",
  },
  {
    title: "Publish",
    text: "This records the domain and puts the site up. No card is charged.",
  },
] as const

type Upload = { src: string; alt: string }

async function readFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return `data:${file.type};base64,${btoa(binary)}`
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-3 py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export function GiveWizard({ offering }: { offering: Offering }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [seed, setSeed] = useState("")
  const [results, setResults] = useState<Availability[]>([])
  const [searchError, setSearchError] = useState("")
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<Availability | null>(null)
  const [purposeId, setPurposeId] = useState("")
  const [optionId, setOptionId] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [fromName, setFromName] = useState("")
  const [greeting, setGreeting] = useState("")
  const [greetingTouched, setGreetingTouched] = useState(false)
  const [photoMode, setPhotoMode] = useState<"sample" | "upload">("sample")
  const [uploads, setUploads] = useState<Upload[]>([])
  const [photoError, setPhotoError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  const purpose = offering.purposes.find((item) => item.id === purposeId)
  const option = purpose?.options.find((item) => item.id === optionId)
  const greetingValue = greetingTouched
    ? greeting
    : purpose
      ? renderGreeting(purpose.greeting, recipientName, fromName)
      : ""
  const copy = STEP_COPY[step]

  async function search() {
    setSearching(true)
    setSearchError("")
    setFormError("")
    try {
      const response = await fetch("/api/domains/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ seed }),
      })
      const payload = (await response.json()) as {
        results?: Availability[]
        error?: string
      }
      if (!response.ok) {
        setResults([])
        setSearchError(payload.error ?? "The domain check failed.")
        return
      }
      setResults(payload.results ?? [])
      if (payload.error) setSearchError(payload.error)
    } catch {
      setSearchError("The domain check failed. Try again.")
    } finally {
      setSearching(false)
    }
  }

  async function onFiles(list: FileList | null) {
    setPhotoError("")
    if (!list || list.length === 0) return
    const files = [...list].slice(0, 4)
    if (list.length > 4) setPhotoError("Only the first four photos were kept.")
    const next: Upload[] = []
    for (const file of files) {
      if (!["image/png", "image/jpeg", "image/gif", "image/webp"].includes(file.type)) {
        setPhotoError("Use PNG, JPEG, GIF, or WebP photos.")
        return
      }
      if (file.size > 280_000) {
        setPhotoError("Each photo needs to be under about 300KB.")
        return
      }
      next.push({
        src: await readFile(file),
        alt: `Photo for ${recipientName || "the recipient"}`,
      })
    }
    setUploads(next)
    setPhotoMode("upload")
  }

  async function publish() {
    if (!selected || !purpose || !option) return
    setSubmitting(true)
    setFormError("")
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          offeringId: offering.id,
          domain: selected.domain,
          purposeId: purpose.id,
          optionId: option.id,
          recipientName,
          fromName,
          greeting: greetingValue,
          photos: photoMode === "sample" ? "sample" : uploads,
        }),
      })
      const payload = (await response.json()) as {
        order?: { id: string }
        error?: string
        code?: string
      }
      if (!response.ok || !payload.order) {
        setFormError(payload.error ?? "The site was not published.")
        if (payload.code === "unavailable") setStep(0)
        return
      }
      router.push(`/orders/${payload.order.id}`)
    } catch {
      setFormError("The site was not published. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-primary uppercase">{offering.name}</p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">Start a gift</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">{offering.summary}</p>

      <div className="mt-10">
        <div className="mb-3 flex items-center justify-between text-[0.7rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="h-px bg-border">
          <div
            className="h-px bg-primary transition-[width] duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <ol className="mt-4 grid grid-cols-5 gap-2">
          {STEPS.map((label, index) => {
            const active = index === step
            const done = index < step
            return (
              <li key={label} className="text-center" aria-current={active ? "step" : undefined}>
                <span
                  className={cn(
                    "mx-auto grid size-7 place-items-center rounded-full text-xs",
                    active && "bg-primary text-primary-foreground",
                    done && "bg-primary/10 text-primary",
                    !active && !done && "bg-muted text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
                <span className={cn("mt-1 hidden text-[11px] sm:block", active ? "text-foreground" : "text-muted-foreground")}>
                  {label}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="mt-10">
        <h2 className="font-serif text-2xl font-medium tracking-tight">{copy.title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.text}</p>

        <div className="mt-6">
          {step === 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain-seed">Name or domain</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="domain-seed"
                    value={seed}
                    placeholder="mina"
                    className="h-11 bg-card"
                    onValueChange={setSeed}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault()
                        void search()
                      }
                    }}
                  />
                  <Button type="button" className="h-11 px-5" onClick={() => void search()} disabled={searching}>
                    {searching ? "Checking…" : "Check domains"}
                  </Button>
                </div>
              </div>
              {searchError ? (
                <p className="text-sm text-destructive" role="alert">
                  {searchError}
                </p>
              ) : null}
              {results.length > 0 ? (
                <ul className="divide-y divide-border border-y border-border">
                  {results.map((result) => {
                    const active = selected?.domain === result.domain
                    return (
                      <li key={result.domain}>
                        <button
                          type="button"
                          disabled={!result.available}
                          onClick={() => setSelected(result)}
                          className={cn(
                            "flex w-full items-center justify-between gap-4 py-4 text-left",
                            active && "text-foreground",
                            !result.available && "cursor-not-allowed opacity-50",
                          )}
                        >
                          <span>
                            <span className="block font-medium">{result.domain}</span>
                            <span className="text-sm text-muted-foreground">
                              {result.available
                                ? `${formatPrice(result.priceCents)} recorded, not charged`
                                : (result.reason ?? "Unavailable")}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "shrink-0 text-sm",
                              active ? "font-medium text-primary" : "text-muted-foreground",
                            )}
                          >
                            {result.available ? (active ? "Selected" : "Available") : "Taken"}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-3">
              {offering.purposes.map((item) => {
                const active = purposeId === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPurposeId(item.id)
                      setOptionId("")
                      setGreetingTouched(false)
                    }}
                    className={cn(
                      "border bg-card px-5 py-4 text-left",
                      active ? "border-primary" : "border-border",
                    )}
                  >
                    <span className="flex items-start justify-between gap-4">
                      <span className="font-serif text-xl font-medium tracking-tight">{item.label}</span>
                      <span className="text-xs tracking-wide text-primary uppercase">{active ? "Selected" : ""}</span>
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">{item.description}</span>
                  </button>
                )
              })}
            </div>
          ) : null}

          {step === 2 && purpose ? (
            <div className="grid gap-3">
              {purpose.options.map((item) => {
                const active = optionId === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOptionId(item.id)}
                    className={cn(
                      "border bg-card px-5 py-4 text-left",
                      active ? "border-primary" : "border-border",
                    )}
                  >
                    <span className="flex items-start justify-between gap-4">
                      <span className="font-serif text-xl font-medium tracking-tight">{item.name}</span>
                      <span className="text-xs tracking-wide text-primary uppercase">{active ? "Selected" : ""}</span>
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">{item.description}</span>
                  </button>
                )
              })}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient</Label>
                  <Input
                    id="recipient"
                    value={recipientName}
                    className="h-11 bg-card"
                    onValueChange={setRecipientName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from">Your name</Label>
                  <Input id="from" value={fromName} className="h-11 bg-card" onValueChange={setFromName} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="greeting">Greeting</Label>
                <Textarea
                  id="greeting"
                  value={greetingValue}
                  className="min-h-28 bg-card"
                  onChange={(event) => {
                    setGreetingTouched(true)
                    setGreeting(event.target.value)
                  }}
                />
              </div>
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">Photos</legend>
                <p className="text-sm text-muted-foreground">
                  They appear under the game. The sample set is three illustrations, not real photographs.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant={photoMode === "sample" ? "default" : "outline"}
                    className="h-11"
                    onClick={() => setPhotoMode("sample")}
                  >
                    Use the sample set
                  </Button>
                  <Label className="inline-flex h-11 cursor-pointer items-center rounded-lg border border-border bg-card px-4 text-sm">
                    Upload photos
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      multiple
                      className="sr-only"
                      onChange={(event) => void onFiles(event.target.files)}
                    />
                  </Label>
                </div>
                {photoMode === "upload" ? (
                  <p className="text-sm text-muted-foreground">
                    {uploads.length === 0
                      ? "No photos yet."
                      : `${uploads.length} photo${uploads.length === 1 ? "" : "s"} ready.`}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Sample set selected.</p>
                )}
                {photoError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {photoError}
                  </p>
                ) : null}
              </fieldset>
            </div>
          ) : null}

          {step === 4 && selected && purpose && option ? (
            <dl className="divide-y divide-border border-y border-border">
              <Row label="Domain" value={`${selected.domain} · ${formatPrice(selected.priceCents)} for one year, recorded`} />
              <Row label="Gift" value={offering.name} />
              <Row label="Purpose" value={purpose.label} />
              <Row label="Game" value={option.name} />
              <Row label="For" value={`${recipientName || "—"} from ${fromName || "—"}`} />
              <Row label="Greeting" value={greetingValue} />
              <Row label="Photos" value={photoMode === "sample" ? "Sample set" : `${uploads.length} uploaded`} />
            </dl>
          ) : null}
        </div>
      </div>

      {formError ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 px-4"
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0 || submitting}
        >
          Back
        </Button>
        {step < 4 ? (
          <Button
            type="button"
            className="h-11 px-5"
            disabled={
              (step === 0 && !selected?.available) ||
              (step === 1 && !purposeId) ||
              (step === 2 && !optionId) ||
              (step === 3 &&
                (!recipientName.trim() ||
                  !fromName.trim() ||
                  !greetingValue.trim() ||
                  (photoMode === "upload" && uploads.length === 0)))
            }
            onClick={() => setStep((current) => current + 1)}
          >
            Continue
          </Button>
        ) : (
          <Button type="button" className="h-11 px-5" disabled={submitting} onClick={() => void publish()}>
            {submitting ? "Publishing…" : "Publish the site"}
          </Button>
        )}
      </div>
    </div>
  )
}
