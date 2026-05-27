import { IsString, IsOptional, IsNumber, IsDateString, IsNotEmpty } from 'class-validator';

export class CreatePackageOrderDto {
  @IsString()
  @IsNotEmpty()
  codigoRastreio: string;

  @IsNumber()
  @IsNotEmpty()
  recipientId: number;

  @IsDateString()
  @IsNotEmpty()
  dataRecebimento: string;
}

export class UpdatePackageOrderDto {
  @IsOptional()
  @IsString()
  codigoRastreio?: string;

  @IsOptional()
  @IsNumber()
  recipientId?: number;

  @IsOptional()
  @IsDateString()
  dataRecebimento?: string;
}
