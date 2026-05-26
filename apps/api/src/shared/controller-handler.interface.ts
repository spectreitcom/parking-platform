export interface IControllerHandler<T = unknown> {
  handle(...args: unknown[]): Promise<T> | T;
}
