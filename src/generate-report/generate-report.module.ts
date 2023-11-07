import { Module } from '@nestjs/common';
import { GenerateReportService } from './generate-report.service';
import { GenerateReportController } from './generate-report.controller';
import { AttendanceControlModule } from 'src/attendance-control/attendance-control.module';
import { AppScheduleModule } from 'src/schedule/schedule.module';

@Module({
  controllers: [GenerateReportController],
  providers: [GenerateReportService],
  exports: [ GenerateReportService ],
  imports: [ 
    AttendanceControlModule,  
    AppScheduleModule, 
  ]
})
export class GenerateReportModule {}
