import { IsString, IsOptional, IsBoolean, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateGuestDto {
  @IsNumber()
  @IsNotEmpty()
  reservationId: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateGuestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isPresent?: boolean;
}
