import type { GiftPhoto } from "@/lib/store"
import { OrderError } from "@/lib/errors"

export const SAMPLE_PHOTOS: GiftPhoto[] = [
  {
    id: "sample-boat",
    alt: "Sample picture of a paper boat",
    src: "/samples/boat.svg",
  },
  {
    id: "sample-window",
    alt: "Sample picture of a sunny window",
    src: "/samples/window.svg",
  },
  {
    id: "sample-table",
    alt: "Sample picture of a kitchen table",
    src: "/samples/table.svg",
  },
]

const DATA_URL =
  /^data:image\/(png|jpeg|gif|webp);base64,[a-z0-9+/=\s]+$/i

export function resolvePhotos(
  photos: "sample" | { src: string; alt?: string }[] | undefined,
  recipient: string,
): GiftPhoto[] {
  if (photos === undefined || photos === "sample") return SAMPLE_PHOTOS
  if (!Array.isArray(photos) || photos.length === 0) {
    throw new OrderError(
      "Add at least one photo, or use the sample set.",
      400,
      "photos",
    )
  }
  if (photos.length > 4) {
    throw new OrderError("Use up to four photos.", 400, "photos")
  }

  return photos.map((photo, index) => {
    const src = typeof photo?.src === "string" ? photo.src.trim() : ""
    if (src.length > 400_000 || !DATA_URL.test(src)) {
      throw new OrderError(
        "Photos must be PNG, JPEG, GIF, or WebP images under about 300KB.",
        400,
        "photos",
      )
    }
    const alt =
      typeof photo.alt === "string" && photo.alt.trim()
        ? photo.alt.trim().slice(0, 120)
        : `Photo for ${recipient}`
    return { id: `upload-${index + 1}`, alt, src }
  })
}
