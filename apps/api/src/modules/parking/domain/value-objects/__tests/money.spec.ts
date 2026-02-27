import { Money } from '../money';

describe('Money', () => {
  it('should create from number', () => {
    const money = Money.fromNumber(1000);
    expect(money.value).toBe(1000);
  });

  it('should convert to PLN', () => {
    const money = Money.fromNumber(1250);
    expect(money.toPLN()).toBe(12.5);
  });

  it('should throw error if not integer', () => {
    expect(() => Money.fromNumber(10.5)).toThrow('Invalid Money');
  });

  it('should add money', () => {
    const m1 = Money.fromNumber(100);
    const m2 = Money.fromNumber(200);
    const sum = m1.add(m2);
    expect(sum.value).toBe(300);
  });

  it('should subtract money', () => {
    const m1 = Money.fromNumber(300);
    const m2 = Money.fromNumber(100);
    const diff = m1.subtract(m2);
    expect(diff.value).toBe(200);
  });

  it('should compare two money objects', () => {
    const m1 = Money.fromNumber(100);
    const m2 = Money.fromNumber(100);
    const m3 = Money.fromNumber(200);

    expect(m1.equals(m2)).toBe(true);
    expect(m1.equals(m3)).toBe(false);
  });

  it('should throw error if negative', () => {
    expect(() => Money.fromNumber(-100)).toThrow('Invalid Money');
  });

  it('should throw error if subtraction results in negative', () => {
    const m1 = Money.fromNumber(100);
    const m2 = Money.fromNumber(200);
    expect(() => m1.subtract(m2)).toThrow('Invalid Money');
  });
});
