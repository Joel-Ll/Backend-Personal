import { IsString, IsNotEmpty, IsDate, IsArray, IsBoolean, IsOptional, ArrayMinSize, Min, Max, IsInt, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';


class DayScheduleDto {
	@IsNotEmpty()
	@IsInt()
	@Min(0)
	@Max(6)
	day: number;

	@IsString()
	@IsNotEmpty()
	into: string;

	@IsString()
	@IsNotEmpty()
	out: string;

	@IsString()
	@IsNotEmpty()
	intoTwo: string;

	@IsString()
	@IsNotEmpty()
	outTwo: string;

	@IsInt()
	@Min(0)
	@Max(60)
	toleranceInto: number;

	@IsInt()
	@Min(0)
	@Max(60)
	toleranceOut: number;
}

export class SpecialDayScheduleDto extends DayScheduleDto {

	@IsString()
	@IsNotEmpty()
	name: string;
	
	@IsNotEmpty()
	@IsBoolean()
	permanente: boolean;

	@ValidateIf((schedule: SpecialDayScheduleDto) => schedule.permanente)
	@IsArray()
	@IsDate({ each: true })
	@ArrayMinSize(2)
	@IsOptional()
	dateRange?: Date[];

	@IsArray()
	@IsString({ each: true })
	usersAssigned: string[];

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@IsOptional()
	@IsDate()
	createdAt?: Date;
}

export class CreateScheduleDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => DayScheduleDto)
	scheduleNormal: DayScheduleDto[];

	@IsArray()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => SpecialDayScheduleDto)
	scheduleSpecial?: SpecialDayScheduleDto[];

	@IsOptional()
	@IsBoolean()
	isActive: boolean;

	@IsOptional()
	@IsDate()
	createdAt: Date;
}
