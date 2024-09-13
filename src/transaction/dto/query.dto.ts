import { Type } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsInt,
  Min,
  IsPositive,
} from 'class-validator';

export class QueryDto {
  @IsOptional()
  @IsInt({ message: 'Invalid limit format' })
  @IsPositive()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Invalid amount format' })
  @Min(0)
  @Type(() => Number)
  'amount:lt'?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Invalid amount format' })
  @Min(0)
  @Type(() => Number)
  'amount:gt'?: number;

  @IsOptional()
  @IsString()
  'note:like'?: string;
}
