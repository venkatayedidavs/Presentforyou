export const GAME_IDS = [
  "balloon-pop",
  "candle-count",
  "letter-catch",
  "pack-bag",
  "memory-match",
  "color-tiles",
] as const

export type GameId = (typeof GAME_IDS)[number]

export function isGameId(value: string): value is GameId {
  return (GAME_IDS as readonly string[]).includes(value)
}

export type GiftOption = {
  id: string
  gameId: GameId
  name: string
  description: string
}

export type Purpose = {
  id: string
  label: string
  description: string
  greeting: string
  options: GiftOption[]
}

export type Offering = {
  id: string
  name: string
  summary: string
  detail: string
  purposes: Purpose[]
}

export const GREETING_SITE_ID = "greeting-site"

const offerings: Offering[] = [
  {
    id: GREETING_SITE_ID,
    name: "Greeting site",
    summary:
      "A short greeting, a small game, and a few photos on a domain you give.",
    detail:
      "This is the first site Given can publish. It is the version a parent gives a child: their own domain, a greeting, a game made for them, and photos underneath.",
    purposes: [
      {
        id: "birthday",
        label: "Birthday gift for my kid",
        description: "A birthday greeting and a short game on their domain.",
        greeting: "{recipient}, this domain is yours. Happy birthday. — {from}",
        options: [
          {
            id: "balloon-pop",
            gameId: "balloon-pop",
            name: "Balloon pop",
            description: "Pop a handful of balloons with their name on the board.",
          },
          {
            id: "candle-count",
            gameId: "candle-count",
            name: "Candle count",
            description: "Light five candles for them.",
          },
        ],
      },
      {
        id: "first-day",
        label: "First day of school",
        description: "A send-off for the first day, with a small game to play.",
        greeting:
          "{recipient}, this domain is yours. Have a good first day. — {from}",
        options: [
          {
            id: "letter-catch",
            gameId: "letter-catch",
            name: "Letter catch",
            description: "Spell their name from a tray of letters.",
          },
          {
            id: "pack-bag",
            gameId: "pack-bag",
            name: "Pack the bag",
            description: "Choose what goes in a school bag.",
          },
        ],
      },
      {
        id: "just-because",
        label: "Just because",
        description: "No occasion. A domain and a site, given because you wanted to.",
        greeting: "{recipient}, this domain is yours. — {from}",
        options: [
          {
            id: "memory-match",
            gameId: "memory-match",
            name: "Memory match",
            description: "Turn over three pairs of cards.",
          },
          {
            id: "color-tiles",
            gameId: "color-tiles",
            name: "Color tiles",
            description: "Fill a small board with color.",
          },
        ],
      },
    ],
  },
]

export function listOfferings(): Offering[] {
  return offerings
}

export function getOffering(id: string): Offering | undefined {
  return offerings.find((offering) => offering.id === id)
}

export function renderGreeting(
  template: string,
  recipient: string,
  from: string,
): string {
  return template
    .replaceAll("{recipient}", recipient.trim() || "Friend")
    .replaceAll("{from}", from.trim() || "me")
}
