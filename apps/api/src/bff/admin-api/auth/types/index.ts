export type JwtPayload = {
  sub: string;
};

export type RequestUser = {
  id: string;
  isSuperAdmin: boolean;
};
