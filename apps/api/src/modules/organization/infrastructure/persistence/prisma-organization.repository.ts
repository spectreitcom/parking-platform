import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from '../../application/ports/organization.repository';
import { RepositorySaveOptions } from 'src/shared/types';
import { Organization } from '../../domain/organization';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { PrismaTx } from '../../../../shared/prisma/types';
import { OrganizationId } from '../../domain/value-objects/organization-id';
import { OrganizationName } from '../../domain/value-objects/organization-name';
import { OrganizationAddress } from '../../domain/value-objects/organization-address';
import { OrganizationTaxId } from '../../domain/value-objects/organization-tax-id';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import { OrganizationMember } from '../../domain/entities/organization-member';
import { OrganizationMemberId } from '../../domain/value-objects/organization-member-id';
import { OrganizationUserId } from '../../domain/value-objects/organization-user-id';
import { ConcurrencyError } from '../../../../shared/errors';

@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(
    organization: Organization,
    options?: RepositorySaveOptions,
  ): Promise<void> {
    const isNew = options?.isNew ?? false;
    const currentVersion = organization.getVersion().value;
    const id = organization.getId().value;
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
          name: organization.getName().value,
          address: organization.getAddress().value,
          taxId: organization.getTaxId().value,
          version: 1,
        },
      });
      return;
    }

    try {
      const existingMembers = [...record.members];

      const membersToAdd = organization
        .getMembers()
        .filter(
          (member) =>
            !existingMembers.some((existingMember) =>
              OrganizationMemberId.fromString(existingMember.id).equals(
                member.id,
              ),
            ),
        );

      const membersToRemoveIds = existingMembers
        .filter(
          (existingMember) =>
            !organization
              .getMembers()
              .some((member) =>
                member.id.equals(
                  OrganizationMemberId.fromString(existingMember.id),
                ),
              ),
        )
        .map((member) => member.id);

      await tx.organizationMember.createMany({
        data: membersToAdd.map((member) => ({
          organizationId: id,
          organizationUserId: member.organizationUserId.value,
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
        where: { id },
        data: {
          name: organization.getName().value,
          address: organization.getAddress().value,
          taxId: organization.getTaxId().value,
          version: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new ConcurrencyError('Parking', id);
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

    return new Organization(
      OrganizationId.fromString(record.id),
      OrganizationName.fromString(record.name),
      OrganizationAddress.fromString(record.address),
      OrganizationTaxId.fromString(record.taxId),
      AggregateVersion.fromNumber(record.version),
      record.members.map(
        (member) =>
          new OrganizationMember(
            OrganizationMemberId.fromString(member.id),
            member.isRoot,
            OrganizationUserId.fromString(member.organizationUserId),
          ),
      ),
    );
  }
}
