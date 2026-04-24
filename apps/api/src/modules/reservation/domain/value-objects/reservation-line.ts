import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  validateSync,
} from 'class-validator';
import { AppError } from 'src/shared/errors';

export class ReservationLine {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  private readonly _title: string;

  @IsInt()
  @Min(0)
  private readonly _price: number;

  private constructor(title: string, price: number) {
    this._title = title;
    this._price = price;
    this.validate();
  }

  static create(title: string, price: number) {
    return new ReservationLine(title, price);
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid ReservationLine');
    }
  }

  get title() {
    return this._title;
  }

  get price() {
    return this._price;
  }

  equals(other: ReservationLine): boolean {
    return this._title === other._title && this._price === other._price;
  }
}
