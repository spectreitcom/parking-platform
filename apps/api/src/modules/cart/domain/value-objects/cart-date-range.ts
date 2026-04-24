import { IsInt, IsPositive, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';

export class CartDateRange {
  @IsInt()
  @IsPositive()
  private readonly _arrival: number;

  @IsInt()
  @IsPositive()
  private readonly _departure: number;

  private constructor(arrival: number, departure: number) {
    this._arrival = arrival;
    this._departure = departure;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);

    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid CartDateRange');
    }

    if (this._departure <= this._arrival) {
      throw new AppError('VALIDATION_ERROR', 'Departure must be after arrival');
    }
  }

  static fromValues(arrival: number, departure: number) {
    return new CartDateRange(arrival, departure);
  }

  get diffDays() {
    return Math.ceil((this._departure - this._arrival) / (1000 * 60 * 60 * 24));
  }

  get departure() {
    return this._departure;
  }

  get arrival() {
    return this._arrival;
  }

  equals(other: CartDateRange) {
    return (
      this._arrival === other._arrival && this._departure === other._departure
    );
  }
}
