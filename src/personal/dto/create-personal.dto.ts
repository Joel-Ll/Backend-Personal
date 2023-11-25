import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsMobilePhone, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreatePersonalDto {

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	lastName: string;

	@IsString()
	@IsNotEmpty()
	gender: string;

	@IsString()
	@IsNotEmpty()
	ci: string;

	@IsEmail()
	@IsNotEmpty()
	email: string;

	// @IsMobilePhone()
	@IsString()
	@IsNotEmpty()
	phone: string;

	@IsString()
	@IsNotEmpty()
	address: string;

	@IsString()
	@IsNotEmpty()
	nationality: string;

	@IsString()
	@IsNotEmpty()
	unity: string;

	@IsString()
	@IsNotEmpty()
	charge: string;

	@IsString()
	@IsOptional()
	file?: string;

	@IsString()
	@IsNotEmpty()
	schedule: string;

	@IsNumber()
	@IsNotEmpty()
	level: string;

	isActive: boolean;
}
