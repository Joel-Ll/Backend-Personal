
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class EntranceRecord {
	@Prop()
	hour: string;

	@Prop()
	tolerance: number;

	@Prop()
	marketHour: string;

	@Prop()
	infraccion: string;

	@Prop()
	type: string;

	@Prop()
	status: string;

	@Prop()
	shift: string;
}

const EntranceRecordSchema = SchemaFactory.createForClass(EntranceRecord);

@Schema()
export class ExitRecord {
	@Prop()
	hour: string;

	@Prop()
	tolerance: number;

	@Prop()
	marketHour: string;

	@Prop()
	infraccion: string;

	@Prop()
	type: string;

	@Prop()
	status: string;

	@Prop()
	shift: string;
}

const ExitRecordSchema = SchemaFactory.createForClass(ExitRecord);

@Schema()
export class DailyAttendanceDetail {
	@Prop()
	date: string;

	@Prop()
	specialDay: string;

	@Prop({ type: [EntranceRecordSchema] })
	entrances: EntranceRecord[];  

	@Prop({ type: [ExitRecordSchema] })
	exits: ExitRecord[];
}

const DailyAttendanceDetailSchema = SchemaFactory.createForClass(DailyAttendanceDetail);

@Schema()
export class PersonalAttendance extends Document {
	@Prop()
	personalId: string;

	@Prop()
	name: string;

	@Prop()
	lastName: string;

	@Prop()
	ci: string;

	@Prop()
	schedule: string;

	@Prop({ type: [DailyAttendanceDetailSchema] })
	attendanceDetail: DailyAttendanceDetail[];
}

export const PersonalAttendanceSchema = SchemaFactory.createForClass(PersonalAttendance)