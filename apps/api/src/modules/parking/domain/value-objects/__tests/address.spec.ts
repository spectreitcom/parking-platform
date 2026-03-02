import { Address } from '../address';

describe('Address', () => {
  it('should create from string and trim whitespace', () => {
    const addressStr = '  Main Street 1  ';
    const address = Address.fromString(addressStr);
    expect(address.value).toBe('Main Street 1');
  });

  it('should replace multiple spaces with single space', () => {
    const addressStr = 'Main    Street   1';
    const address = Address.fromString(addressStr);
    expect(address.value).toBe('Main Street 1');
  });

  it('should throw error for empty address', () => {
    const invalidAddress = '';
    expect(() => Address.fromString(invalidAddress)).toThrow('Invalid Address');
  });

  it('should throw error for too long address', () => {
    const longAddress = 'A'.repeat(256);
    expect(() => Address.fromString(longAddress)).toThrow('Invalid Address');
  });

  it('should compare two addresses for equality', () => {
    const addressStr = 'Main Street 1';
    const address1 = Address.fromString(addressStr);
    const address2 = Address.fromString('  Main Street 1  ');
    const address3 = Address.fromString('Other Street 2');

    expect(address1.equals(address2)).toBe(true);
    expect(address1.equals(address3)).toBe(false);
  });
});
