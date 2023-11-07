import { PartialType } from '@nestjs/swagger';
import { CreateAttendanceControlDto } from './create-attendance-control.dto';

export class UpdateAttendanceControlDto extends PartialType(CreateAttendanceControlDto) {}
