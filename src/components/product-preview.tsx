import { BALLOON_LOOKS, BalloonArt } from "@/components/games/balloon-art"

const spots = [
  { left: "8%", top: "16%" },
  { left: "26%", top: "6%" },
  { left: "44%", top: "18%" },
  { left: "62%", top: "4%" },
  { left: "78%", top: "20%" },
]

export function ProductPreview() {
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_30px_70px_-40px_rgba(20,20,20,0.55)]">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#e4e1da]" />
          <span className="size-2.5 rounded-full bg-[#e4e1da]" />
          <span className="size-2.5 rounded-full bg-[#e4e1da]" />
        </span>
        <div className="min-w-0 flex-1 truncate rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
          mina.com
        </div>
      </div>
      <div className="px-4 pt-5 pb-4 sm:px-5">
        <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">Greeting</p>
        <p className="mt-2 font-serif text-[1.65rem] leading-tight font-medium tracking-tight">
          Mina, this domain is yours. Happy birthday.
        </p>
        <div className="gv-sky relative mt-4 h-40 overflow-hidden rounded-lg" aria-hidden>
          <div className="gv-cloud w-16" style={{ top: "14%", left: "10%" }} />
          <div className="gv-hill" />
          {spots.map((spot, index) => {
            const look = BALLOON_LOOKS[index]
            return (
              <div key={spot.left} className="absolute w-11" style={spot}>
                <BalloonArt
                  color={look.color}
                  shade={look.shade}
                  highlight={look.highlight}
                  letter="M"
                  gradientId={`preview-balloon-${index}`}
                />
              </div>
            )
          })}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["/samples/boat.svg", "/samples/window.svg", "/samples/table.svg"].map((src) => (
            // Decorative stand-ins inside the product frame.
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className="aspect-[4/3] w-full rounded-md object-cover" />
          ))}
        </div>
      </div>
      <figcaption className="border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-5">
        A greeting site, as it publishes.
      </figcaption>
    </figure>
  )
}
