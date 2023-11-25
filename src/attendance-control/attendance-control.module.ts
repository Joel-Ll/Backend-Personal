import { Module, forwardRef } from '@nestjs/common';
import { AttendanceControlService } from './attendance-control.service';
import { AttendanceControlController } from './attendance-control.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Personal, PersonalSchema } from 'src/personal/schemas/personal.schema';
import { PersonalModule } from 'src/personal/personal.module';
import { Schedule, ScheduleSchema } from 'src/schedule/schemas/schedule.schema';
import { AppScheduleModule } from 'src/schedule/schedule.module';
import { PersonalAttendance, PersonalAttendanceSchema } from './schemas/attendance-control.schema';
import { GenerateReportModule } from 'src/generate-report/generate-report.module';
import { LicenseModule } from 'src/license/license.module';
import { ChargeModule } from 'src/charge/charge.module';
import { Charge, ChargeSchema } from 'src/charge/schemas/charge.schema';

@Module({
  controllers: [AttendanceControlController],
  providers: [AttendanceControlService],
  imports: [
    MongooseModule.forFeature([
      {
        name: PersonalAttendance.name,
        schema: PersonalAttendanceSchema
      },
      {
        name: Personal.name, 
        schema: PersonalSchema
      },
      {
        name: Schedule.name, 
        schema: ScheduleSchema
      },
      {
        name: Charge.name, 
        schema: ChargeSchema
      }
    ]),
    PersonalModule,
    AppScheduleModule,
    LicenseModule,
    ChargeModule,
    forwardRef(() => GenerateReportModule)
  ],
  exports: [
    AttendanceControlService
  ]
})
export class AttendanceControlModule {}
