import { IsUUID, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';
import { randomUUID } from 'node:crypto';

export class ParkingSpotId {
  @IsUUID()
  private readonly _value: string;

  constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', `Invalid ParkingSpotId`);
    }
  }

  get value(): string {
    return this._value;
  }

  static create() {
    return new ParkingSpotId(randomUUID());
  }

  static fromString(value: string) {
    return new ParkingSpotId(value);
  }

  equals(other: ParkingSpotId): boolean {
    return this._value === other._value;
  }
}
