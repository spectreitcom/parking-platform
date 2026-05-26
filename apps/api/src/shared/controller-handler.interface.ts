export interface IControllerHandler<
  TArgs extends unknown[] = unknown[],
  TResult = unknown,
> {
  handle(...args: TArgs): Promise<TResult> | TResult;
}
