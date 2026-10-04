export class OrderError extends Error {
  readonly status: number
  readonly code: string

  constructor(message: string, status: number, code: string) {
    super(message)
    this.name = "OrderError"
    this.status = status
    this.code = code
  }
}
