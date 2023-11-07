import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Schedule, ScheduleSchema } from './schemas/schedule.schema';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Schedule.name,
        schema: ScheduleSchema
      },
    ])
  ],
  exports: [
    ScheduleService
  ]
})
export class AppScheduleModule {}
