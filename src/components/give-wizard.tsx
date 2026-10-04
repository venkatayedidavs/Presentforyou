"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { renderGreeting, type Offering } from "@/lib/catalog"
import { formatPrice } from "@/lib/domain"
import type { Availability } from "@/lib/registrar"
import { useRouter } from "next/navigation"
import { useState } from "react"

const STEPS = ["Domain", "Purpose", "Game", "Greeting", "Publish"] as const

type Upload = { src: string; alt: string }

async function readFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return `data:${file.type};base64,${btoa(binary)}`
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
      <p className="text-sm font-medium text-primary">{offering.name}</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Give a domain</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">{offering.summary}</p>

      <ol className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={index === step ? "font-medium text-foreground" : "text-muted-foreground"}
            aria-current={index === step ? "step" : undefined}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="mt-8">
        {step === 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain-seed">Name or domain</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="domain-seed"
                  value={seed}
                  placeholder="mina"
                  className="h-11"
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
              <ul className="space-y-2">
                {results.map((result) => {
                  const active = selected?.domain === result.domain
                  return (
                    <li key={result.domain}>
                      <button
                        type="button"
                        disabled={!result.available}
                        onClick={() => setSelected(result)}
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
                          active ? "border-primary bg-card ring-2 ring-primary" : "border-border bg-card"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        <span>
                          <span className="block font-medium">{result.domain}</span>
                          <span className="text-sm text-muted-foreground">
                            {result.available
                              ? `${formatPrice(result.priceCents)} recorded, not charged`
                              : (result.reason ?? "Unavailable")}
                          </span>
                        </span>
                        <span className="text-sm">{result.available ? (active ? "Selected" : "Available") : "Taken"}</span>
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
            {offering.purposes.map((item) => (
              <Card
                key={item.id}
                className={purposeId === item.id ? "ring-2 ring-primary" : undefined}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => {
                    setPurposeId(item.id)
                    setOptionId("")
                    setGreetingTouched(false)
                  }}
                >
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">{item.label}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </button>
              </Card>
            ))}
          </div>
        ) : null}

        {step === 2 && purpose ? (
          <div className="grid gap-3">
            {purpose.options.map((item) => (
              <Card key={item.id} className={optionId === item.id ? "ring-2 ring-primary" : undefined}>
                <button type="button" className="w-full text-left" onClick={() => setOptionId(item.id)}>
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </button>
              </Card>
            ))}
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
                  className="h-11"
                  onValueChange={setRecipientName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from">Your name</Label>
                <Input
                  id="from"
                  value={fromName}
                  className="h-11"
                  onValueChange={setFromName}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="greeting">Greeting</Label>
              <Textarea
                id="greeting"
                value={greetingValue}
                className="min-h-28"
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
                <Label className="inline-flex h-11 cursor-pointer items-center rounded-lg border border-border px-4 text-sm">
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
                  {uploads.length === 0 ? "No photos yet." : `${uploads.length} photo${uploads.length === 1 ? "" : "s"} ready.`}
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
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Review the gift</CardTitle>
              <CardDescription>
                Completing this records the domain with the mock registrar and publishes the site. No card is charged.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Domain. </span>
                {selected.domain} · {formatPrice(selected.priceCents)} for one year, recorded only
              </p>
              <p>
                <span className="text-muted-foreground">Gift. </span>
                {offering.name}
              </p>
              <p>
                <span className="text-muted-foreground">Purpose. </span>
                {purpose.label}
              </p>
              <p>
                <span className="text-muted-foreground">Game. </span>
                {option.name}
              </p>
              <p>
                <span className="text-muted-foreground">For. </span>
                {recipientName || "—"} from {fromName || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Greeting. </span>
                {greetingValue}
              </p>
              <p>
                <span className="text-muted-foreground">Photos. </span>
                {photoMode === "sample" ? "Sample set" : `${uploads.length} uploaded`}
              </p>
            </CardContent>
          </Card>
        ) : null}
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
