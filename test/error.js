export default class APIError extends Error {
  constructor (code, message) {
    super()
    Error.captureStackTrace( this, this.constructor )
    this.name = code
    this.message = message
  }
}