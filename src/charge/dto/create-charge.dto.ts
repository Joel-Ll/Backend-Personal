import { IsString } from 'class-validator';

export class CreateChargeDto {
	@IsString()
	name: string;

	@IsString()
	description: string;

	isActive: boolean;
}
