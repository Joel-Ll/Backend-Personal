import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateLicenseDto {
  @IsNotEmpty()
  personal: string; 

  @IsNotEmpty()
  @IsString()
  licenseType: string;
	
	@IsNotEmpty()
	@IsString()
	@MinLength(5)
	description: string;

  @IsNotEmpty()
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @IsDate()
  endDate: Date;
}