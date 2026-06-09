import { useSession } from '@tanstack/react-start/server';
import { env } from '#/env.ts';

export type SessionData = {
  accessToken: string;
  refreshToken: string;
};

export function useAppSession() {
  return useSession<SessionData>({
    name: 'app-session',
    password: env.SESSION_SECRET,
    cookie: {
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
    },
  });
}
