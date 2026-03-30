export abstract class Email<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  abstract get to(): string;
  abstract get subject(): string;
  abstract get template(): string;
  abstract get context(): T;
}
