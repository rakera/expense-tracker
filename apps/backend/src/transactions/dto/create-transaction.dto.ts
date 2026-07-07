import {
  type CreateTransactionDto as ICreateTransactionDto,
  TransactionType,
} from '@expense-tracker/shared';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTransactionDto implements ICreateTransactionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string | null;
}
