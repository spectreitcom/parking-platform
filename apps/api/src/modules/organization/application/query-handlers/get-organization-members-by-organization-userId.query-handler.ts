import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrganizationMembersByOrganizationUserIdQuery } from '../queries/get-organization-members-by-organization-userId.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';

export type GetOrganizationMembersByOrganizationUserIdQueryResponse = {
  organizationId: string;
  isRoot: boolean;
}[];

@QueryHandler(GetOrganizationMembersByOrganizationUserIdQuery)
export class GetOrganizationMembersByOrganizationUserIdQueryHandler implements IQueryHandler<
  GetOrganizationMembersByOrganizationUserIdQuery,
  GetOrganizationMembersByOrganizationUserIdQueryResponse
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetOrganizationMembersByOrganizationUserIdQuery,
  ): Promise<GetOrganizationMembersByOrganizationUserIdQueryResponse> {
    return this.prismaService.organizationMember.findMany({
      where: {
        organizationUserId: query.organizationUserId,
      },
      select: {
        organizationId: true,
        isRoot: true,
      },
    });
  }
}
