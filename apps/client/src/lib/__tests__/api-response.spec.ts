import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import { defaultServerError, parseJsonResponse } from '#/lib/api-response.ts';

const responseSchema = z.object({ id: z.uuid(), name: z.string() });

describe('parseJsonResponse', () => {
  it('returns a validated, typed response', async () => {
    const payload = {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Parking Centrum',
    };

    await expect(
      parseJsonResponse(Response.json(payload), responseSchema),
    ).resolves.toEqual(payload);
  });

  it('rejects a response that violates the schema', async () => {
    await expect(
      parseJsonResponse(Response.json({ id: 1 }), responseSchema),
    ).rejects.toBe(defaultServerError);
  });

  it('rejects malformed JSON with the standard server error', async () => {
    const response = new Response('{invalid', {
      headers: { 'Content-Type': 'application/json' },
    });

    await expect(parseJsonResponse(response, responseSchema)).rejects.toBe(
      defaultServerError,
    );
  });
});
