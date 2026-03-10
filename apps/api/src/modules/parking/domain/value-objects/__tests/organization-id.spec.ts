import { OrganizationId } from '../organization-id';
import { randomUUID } from 'node:crypto';

describe('OrganizationId', () => {
  it('should create a valid organization id', () => {
    const id = OrganizationId.create();
    expect(id.value).toBeDefined();
  });

  it('should create from string', () => {
    const uuid = randomUUID();
    const id = OrganizationId.fromString(uuid);
    expect(id.value).toBe(uuid);
  });

  it('should throw error for invalid uuid', () => {
    expect(() => OrganizationId.fromString('invalid')).toThrow(
      'Invalid OrganizationId',
    );
  });

  it('should compare two ids for equality', () => {
    const uuid = randomUUID();
    const id1 = OrganizationId.fromString(uuid);
    const id2 = OrganizationId.fromString(uuid);
    const id3 = OrganizationId.create();

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });

  it('should treat mixed-case UUIDs as equal', () => {
    const uuid = randomUUID();
    const upperUuid = uuid.toUpperCase();
    const lowerUuid = uuid.toLowerCase();

    const id1 = OrganizationId.fromString(upperUuid);
    const id2 = OrganizationId.fromString(lowerUuid);

    expect(id1.equals(id2)).toBe(true);
    expect(id1.value).toBe(lowerUuid);
    expect(id2.value).toBe(lowerUuid);
  });
});
