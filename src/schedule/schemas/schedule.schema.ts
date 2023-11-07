// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// @Schema()
// export class DaySchedule {
// 	@Prop({ required: true })
// 	name: string;

// 	@Prop({ required: true })
// 	into: string;

// 	@Prop({ required: true })
// 	out: string;

// 	@Prop()
// 	intoTwo: string;

// 	@Prop()
// 	outTwo: string;

// 	@Prop({ required: true })
// 	toleranceInto: number;

// 	@Prop({ required: true })
// 	toleranceOut: number;
// }

// @Schema()
// export class SpecialDaySchedule {
// 	@Prop({ required: true })
// 	name: string;

// 	@Prop({ required: true })
// 	into: string;

// 	@Prop({ required: true })
// 	out: string;

// 	@Prop()
// 	intoTwo: string;

// 	@Prop()
// 	outTwo: string;

// 	@Prop({ required: true })
// 	toleranceInto: number;

// 	@Prop({ required: true })
// 	toleranceOut: number;


// 	@Prop({ required: true })
// 	day: number;

// 	@Prop({ required: true })
// 	permanente: boolean;

// 	@Prop({ type: [Date] })
// 	dateRange?: Date[];

// 	@Prop({ required: true, type: Object })
// 	users: {
// 		all?: boolean;
// 		individualUsers?: number[];
// 		byCharge?: string[];
// 		byUnit?: string[];
// 	};

// 	@Prop({ required: true, type: Date })
// 	createdAt: Date;

// 	@Prop({ required: true, default: true })
// 	isActive: boolean;
// }

// @Schema()
// export class Schedule extends Document {
// 	@Prop({ required: true })
// 	name: string;

// 	@Prop({ required: true, type: [DaySchedule] })
// 	scheduleNormal: DaySchedule[];

// 	@Prop({ type: [SpecialDaySchedule] })
// 	scheduleSpecial?: SpecialDaySchedule[];

// 	@Prop({ required: true, type: Date })
// 	createdAt: Date;

// 	@Prop({ required: true, default: true })
// 	isActive: boolean;
// }

// export const ScheduleSchema = SchemaFactory.createForClass(Schedule);


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class DaySchedule {
	@Prop({ required: true })
	day: number;

	@Prop({ required: true })
	into: string;

	@Prop({ required: true })
	out: string;

	@Prop({ required: true })
	intoTwo: string;

	@Prop({ required: true })
	outTwo: string;

	@Prop({ required: true })
	toleranceInto: number;

	@Prop({ required: true })
	toleranceOut: number;
}

const DayScheduleSchema = SchemaFactory.createForClass(DaySchedule);

@Schema()
export class SpecialDaySchedule extends DaySchedule {

	@Prop({ required: true })
	name: string;

	@Prop({ required: true, default: true })
	permanente: boolean;

	@Prop({ type: [Date] })
	dateRange?: Date[];

	@Prop({ type: [''] })
	usersAssigned: string[];

	@Prop({ required: true, default: true })
	isActive: boolean;

	@Prop({ required: true, type: Date, default: Date.now })
	createdAt: Date;
}

const SpecialDayScheduleSchema = SchemaFactory.createForClass(SpecialDaySchedule);

@Schema({ timestamps: true })
export class Schedule extends Document {
	@Prop({ required: true })
	name: string;

	@Prop({ required: true, type: [DayScheduleSchema] })
	scheduleNormal: DaySchedule[];

	@Prop({ type: [SpecialDayScheduleSchema] })
	scheduleSpecial?: SpecialDaySchedule[];

	@Prop({ required: true, default: true })
	isActive: boolean;

	@Prop({ required: true, type: Date, default: Date.now })
	createdAt: Date;

	// @Prop({
	// 	type: mongoose.Schema.Types.ObjectId,
	// 	ref: Schedule.name
	// })
	// schedule: Schedule;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);



// {
// 	"name": "Horario de Oficina",
// 	"scheduleNormal": [
// 			{
// 					"day": 6,
// 					"into": "08:00",
// 					"out": "12:00",
// 					"intoTwo": "13:00",
// 					"outTwo": "17:00",
// 					"toleranceInto": 15,
// 					"toleranceOut": 15
// 			},
// 			{
// 					"day": 2,
// 					"into": "08:00",
// 					"out": "12:00",
// 					"intoTwo": "13:00",
// 					"outTwo": "17:00",
// 					"toleranceInto": 15,
// 					"toleranceOut": 15
// 			}
// 	],
// 	"scheduleSpecial": [
// 			{
// 					"name": "dia del padre",
// 					"day": 2,
// 					"into": "08:00",
// 					"out": "12:00",
// 					"intoTwo": "13:00",
// 					"outTwo": "17:00",
// 					"toleranceInto": 15,
// 					"toleranceOut": 15,
// 					"permanente": false,
// 					"dateRange": ["12-09-2023","12-09-2023"],
// 					"usersAssigned": ["64f2368cfb60066b69a90b9e","64f74d962eea964ad29d47fc"]
// 			}
// 	]
// }