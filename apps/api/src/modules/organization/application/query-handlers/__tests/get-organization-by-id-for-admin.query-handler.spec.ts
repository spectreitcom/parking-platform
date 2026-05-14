import { Test, TestingModule } from '@nestjs/testing';
import { GetOrganizationByIdForAdminQueryHandler } from '../get-organization-by-id-for-admin.query-handler';
import { GetOrganizationByIdForAdminQuery } from '../../queries/get-organization-by-id-for-admin.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AppError } from 'src/shared/errors';
import { OrganizationListForAdminItemReadModel } from '../read-models/organization-list-for-admin-item.read-model';

describe('GetOrganizationByIdForAdminQueryHandler', () => {
  let handler: GetOrganizationByIdForAdminQueryHandler;
  let prismaService: {
    organizationListForAdminRead: {
      findUnique: jest.Mock;
    };
    organizationOrganizationUser: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaService = {
      organizationListForAdminRead: {
        findUnique: jest.fn(),
      },
      organizationOrganizationUser: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrganizationByIdForAdminQueryHandler,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    handler = module.get<GetOrganizationByIdForAdminQueryHandler>(
      GetOrganizationByIdForAdminQueryHandler,
    );
  });

  it('should return organization data when found', async () => {
    const organizationId = 'org-id';
    const query = new GetOrganizationByIdForAdminQuery(organizationId);

    prismaService.organizationListForAdminRead.findUnique.mockResolvedValue({
      organizationId,
      name: 'Test Org',
      address: 'Test Address',
      taxId: '123456789',
      version: 1,
      members: [
        { id: 'member-id', isRoot: true, organizationUserId: 'user-id' },
      ],
    });

    prismaService.organizationOrganizationUser.findMany.mockResolvedValue([
      {
        organizationUserId: 'user-id',
        displayName: 'User',
        email: 'user@example.com',
      },
    ]);

    const result = await handler.execute(query);

    expect(result).toBeInstanceOf(OrganizationListForAdminItemReadModel);
    expect(result.id).toBe(organizationId);
    expect(result.members).toHaveLength(1);
    expect(result.members[0].displayName).toBe('User');
    expect(result.members[0].email).toBe('user@example.com');
  });

  it('should throw AppError when organization not found', async () => {
    const organizationId = 'non-existent-id';
    const query = new GetOrganizationByIdForAdminQuery(organizationId);

    prismaService.organizationListForAdminRead.findUnique.mockResolvedValue(
      null,
    );

    await expect(handler.execute(query)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Organization not found'),
    );
  });
});
