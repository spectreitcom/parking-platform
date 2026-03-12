import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from '../../application/ports/organization.repository';
import { RepositorySaveOptions } from 'src/shared/types';
import { Organization } from '../../domain/organization';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { PrismaTx } from '../../../../shared/prisma/types';
import { ConcurrencyError } from '../../../../shared/errors';
import { OrganizationMapper } from './organization.mapper';

@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(
    organization: Organization,
    options?: RepositorySaveOptions,
  ): Promise<void> {
    const isNew = options?.isNew ?? false;
    const { id, version: currentVersion } =
      OrganizationMapper.toPersistence(organization);
    const _tx = options?.tx;

    if (_tx) {
      await this.createOrUpdate(isNew, currentVersion, id, organization, _tx);
      return;
    }

    return this.prismaService.$transaction(async (tx) => {
      await this.createOrUpdate(isNew, currentVersion, id, organization, tx);
    });
  }

  private async createOrUpdate(
    isNew: boolean,
    currentVersion: number,
    id: string,
    organization: Organization,
    tx: PrismaTx,
  ) {
    const { name, address, taxId, members } =
      OrganizationMapper.toPersistence(organization);

    const record = await tx.organization.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!record) {
      if (!isNew) throw new ConcurrencyError('Organization', id);

      await tx.organization.create({
        data: {
          id,
          name,
          address,
          taxId,
          version: 1,
        },
      });
      return;
    }

    try {
      const existingMembers = [...record.members];

      const membersToAdd = members.filter(
        (member) =>
          !existingMembers.some(
            (existingMember) => existingMember.id === member.id,
          ),
      );

      const membersToRemoveIds = existingMembers
        .filter(
          (existingMember) =>
            !members.some((member) => member.id === existingMember.id),
        )
        .map((member) => member.id);

      await tx.organizationMember.createMany({
        data: membersToAdd.map((member) => ({
          id: member.id,
          organizationId: id,
          organizationUserId: member.organizationUserId,
          isRoot: member.isRoot,
        })),
      });

      await tx.organizationMember.deleteMany({
        where: {
          organizationId: id,
          id: {
            in: membersToRemoveIds,
          },
        },
      });

      await tx.organization.update({
        where: { id, version: currentVersion },
        data: {
          name,
          address,
          taxId,
          version: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new ConcurrencyError('Organization', id);
      }
      throw error;
    }
  }

  async findById(id: string, tx?: PrismaTx): Promise<Organization | null> {
    const prisma = tx ?? this.prismaService;

    const record = await prisma.organization.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!record) return null;

    return OrganizationMapper.toDomain(record);
  }
}
