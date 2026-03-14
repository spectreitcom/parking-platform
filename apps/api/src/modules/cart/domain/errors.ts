export class CartInvalidError extends Error {
  constructor(reason?: string) {
    super(reason);
  }
}
