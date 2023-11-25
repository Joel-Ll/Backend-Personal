import { IsBoolean, IsDate, IsEnum, IsIn, IsNumber, IsOptional, IsString, IsUUID, MinLength, isEnum } from 'class-validator';

export class FilterDto {
	@IsOptional()
	@IsString()
	// @MinLength(3)
	name?: string;

	@IsOptional()
	@IsString()
	// @MinLength(3)
	lastName?: string;
	
	@IsOptional()
	@IsString()
	// @MinLength(3)
	fullName?: string;

	@IsOptional()
	@IsString()
	// @MinLength(3)
	ci?: string;

	@IsOptional()
	@IsString()
	@MinLength(3)
	email?: string;

	@IsOptional()
	@IsString()
	// @MinLength(3)
	phone?: string;

	@IsOptional()
	@IsString()
	// @MinLength(3)
	address?: string;

	@IsOptional()
	@IsString()
	// @MinLength(3)
	nationality?: string;

	@IsOptional()
	@IsIn(['true', 'false', true, false])
	isActive?: boolean | string;

	@IsOptional()
	@IsNumber()
	limit?: number;

	@IsOptional()
	@IsNumber()
	page?: number;
}

export class FilterChargeDto {
	@IsOptional()
	@IsString()
	// @MinLength(3)
	name?: string;

	@IsOptional()
	@IsIn(['true', 'false', true, false])
	isActive?: boolean | string;

	@IsOptional()
	@IsNumber()
	limit?: number;

	@IsOptional()
	@IsNumber()
	page?: number;
}

export class FilterScheduleDto {
	@IsOptional()
	@IsString()
	// @MinLength(3)
	name?: string;

	@IsOptional()
	@IsIn(['true', 'false', true, false])
	isActive?: boolean | string;

	@IsOptional()
	@IsNumber()
	limit?: number;

	@IsOptional()
	@IsNumber()
	page?: number;
}

export class FilterLicenseDto {
	@IsOptional()
	@IsString()
	// @MinLength(3)
	licenseType?: string;

	@IsOptional()
	@IsIn(['true', 'false', true, false])
	isActive?: boolean | string;

	@IsOptional()
	@IsNumber()
	limit?: number;

	@IsOptional()
	@IsNumber()
	page?: number;
}

export class FilterReportAttendace {
	@IsDate()
	initialDate: Date;

	@IsDate()
	endDate: Date;

	@IsUUID()
	@IsString()
	personalId: string;
}