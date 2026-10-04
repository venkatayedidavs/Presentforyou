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
      "Their own domain, a greeting, a short game, and a few photos.",
    detail:
      "The gift a parent gives a child: an address on the web, a note in your words, one game that uses their name, and photographs under the game. Checkout records the domain and publishes the site immediately.",
    purposes: [
      {
        id: "birthday",
        label: "Birthday gift for my kid",
        description: "A birthday note on their domain, and a short game to play there.",
        greeting: "{recipient}, this domain is yours. Happy birthday. — {from}",
        options: [
          {
            id: "balloon-pop",
            gameId: "balloon-pop",
            name: "Balloon pop",
            description: "Eight balloons over a quiet hill. Pop every one.",
          },
          {
            id: "candle-count",
            gameId: "candle-count",
            name: "Candle count",
            description: "A cake in a dark room. Light exactly five candles.",
          },
        ],
      },
      {
        id: "first-day",
        label: "First day of school",
        description: "A send-off for the first morning, with a game on the page.",
        greeting:
          "{recipient}, this domain is yours. Have a good first day. — {from}",
        options: [
          {
            id: "letter-catch",
            gameId: "letter-catch",
            name: "Letter catch",
            description: "Letter tiles on a desk. Spell their name in order.",
          },
          {
            id: "pack-bag",
            gameId: "pack-bag",
            name: "Pack the bag",
            description: "Pack the school things. Leave the rest at home.",
          },
        ],
      },
      {
        id: "just-because",
        label: "Just because",
        description: "No occasion. A domain and a site, because you wanted to give one.",
        greeting: "{recipient}, this domain is yours. — {from}",
        options: [
          {
            id: "memory-match",
            gameId: "memory-match",
            name: "Memory match",
            description: "Three pairs on a felt table. Turn them and match them.",
          },
          {
            id: "color-tiles",
            gameId: "color-tiles",
            name: "Color tiles",
            description: "Sixteen tiles and four glazes. Fill the board.",
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
