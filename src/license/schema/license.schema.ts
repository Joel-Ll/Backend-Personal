import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Personal } from 'src/personal/schemas/personal.schema';

@Schema({ timestamps: true })
export class License extends Document {
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Personal' })
	personal: Personal

	@Prop({ required: true })
	licenseType: string;

	@Prop({ required: true})
	description: string

	@Prop({ required: true })
	startDate: Date;

	@Prop({ required: true })
	endDate: Date;

	@Prop({ default: true })
	isActive: boolean;
}

export const LicenseSchema = SchemaFactory.createForClass(License);
