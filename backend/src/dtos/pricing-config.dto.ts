import { IsNumber, Min, IsOptional } from 'class-validator';

export class UpdatePricingConfigDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  weekdayPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weekendPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  holidayPrice?: number;
}
