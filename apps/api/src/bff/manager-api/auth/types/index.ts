export type JwtPayload = {
  sub: string;
};

export type RequestUser = {
  id: string;
  organizations: {
    organizationId: string;
    isRoot: boolean;
  }[];
};
