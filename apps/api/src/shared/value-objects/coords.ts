import {
  IsNumber,
  validateSync,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { AppError } from '../errors';

export class Coords {
  @IsNumber()
  @IsLatitude()
  private readonly _latitude: number;

  @IsNumber()
  @IsLongitude()
  private readonly _longitude: number;

  private constructor(latitude: number, longitude: number) {
    this._latitude = latitude;
    this._longitude = longitude;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', `Invalid Coords`);
    }
  }

  static fromNumbers(latitude: number, longitude: number) {
    return new Coords(latitude, longitude);
  }

  get latitude() {
    return this._latitude;
  }

  get longitude() {
    return this._longitude;
  }

  equals(other: Coords) {
    return (
      this._latitude === other._latitude && this._longitude === other._longitude
    );
  }
}
