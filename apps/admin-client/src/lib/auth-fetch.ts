import { useAppSession } from '#/lib/session.ts';

type FetchParameter = Parameters<typeof fetch>;

export const authFetch = async (...args: FetchParameter) => {
  const session = await useAppSession();

  return fetch(args[0], {
    ...args[1],
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.data.accessToken ?? ''}`,
      ...args[1]?.headers,
    },
  });
};
