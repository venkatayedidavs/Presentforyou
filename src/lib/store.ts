import fs from "node:fs"
import path from "node:path"

export type Registration = {
  id: string
  domain: string
  provider: string
  status: "registered"
  years: number
  priceCents: number
  registeredAt: string
  orderId: string
}

export type GiftPhoto = {
  id: string
  alt: string
  src: string
}

export type Order = {
  id: string
  offeringId: string
  domain: string
  purposeId: string
  optionId: string
  gameId: string
  recipientName: string
  fromName: string
  greeting: string
  photos: GiftPhoto[]
  registrationId: string
  createdAt: string
}

export type Database = {
  registrations: Registration[]
  orders: Order[]
}

function emptyDatabase(): Database {
  return { registrations: [], orders: [] }
}

export function dataFilePath(): string {
  const dir = process.env.DATA_DIR ?? path.join(process.cwd(), "data")
  return path.join(dir, "given.json")
}

const queues = new Map<string, Promise<unknown>>()

export async function readDatabase(file = dataFilePath()): Promise<Database> {
  try {
    const raw = await fs.promises.readFile(file, "utf8")
    const parsed = JSON.parse(raw) as Partial<Database>
    return {
      registrations: Array.isArray(parsed.registrations) ? parsed.registrations : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyDatabase()
    throw error
  }
}

async function writeDatabase(file: string, db: Database): Promise<void> {
  await fs.promises.mkdir(path.dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.tmp`
  await fs.promises.writeFile(tmp, JSON.stringify(db, null, 2))
  await fs.promises.rename(tmp, file)
}

export function updateDatabase<T>(file: string, mutate: (db: Database) => T): Promise<T> {
  const previous = queues.get(file) ?? Promise.resolve()
  const run = previous.then(async () => {
    const db = await readDatabase(file)
    const result = mutate(db)
    await writeDatabase(file, db)
    return result
  })
  queues.set(
    file,
    run.then(
      () => undefined,
      () => undefined,
    ),
  )
  return run
}
