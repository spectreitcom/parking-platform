import type { z } from 'zod';

export const defaultServerError = new Error(
  'Coś poszło nie tak. Spróbuj ponownie później.',
);

export async function parseJsonResponse<TSchema extends z.ZodType>(
  response: Response,
  schema: TSchema,
): Promise<z.output<TSchema>> {
  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw defaultServerError;
  }

  const result = schema.safeParse(data);

  if (!result.success) {
    throw defaultServerError;
  }

  return result.data;
}
