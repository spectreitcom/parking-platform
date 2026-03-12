export type JwtPayload = {
  sub: string;
};

export type RefreshTokenPayload = {
  sub: string;
  refreshTokenId: string;
};
