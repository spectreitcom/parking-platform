import { AppOrganizationUserStatusMapperService } from '../app-organization-user-status-mapper.service';
import {
  ORGANIZATION_USER_ACTIVE,
  ORGANIZATION_USER_INVITED,
  ORGANIZATION_USER_SUSPENDED,
} from '../../../domain/constants';

describe('AppOrganizationUserStatusMapperService', () => {
  let service: AppOrganizationUserStatusMapperService;

  beforeEach(() => {
    service = new AppOrganizationUserStatusMapperService();
  });

  describe('toText', () => {
    it.each([
      [ORGANIZATION_USER_INVITED, 'Invited'],
      [ORGANIZATION_USER_ACTIVE, 'Active'],
      [ORGANIZATION_USER_SUSPENDED, 'Suspended'],
    ])('should return correct text for status %s', (status, expectedText) => {
      expect(service.toText(status)).toBe(expectedText);
    });

    it('should throw an error for an invalid status', () => {
      expect(() => service.toText('INVALID_STATUS')).toThrow(
        'Invalid organization user status: INVALID_STATUS',
      );
    });

    it('should throw an error for inherited prototype properties', () => {
      // "toString" is a prototype property of Object
      expect(() => service.toText('toString')).toThrow(
        'Invalid organization user status: toString',
      );
    });
  });
});
