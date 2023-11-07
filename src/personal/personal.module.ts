import { Module } from '@nestjs/common';
import { PersonalService } from './personal.service';
import { PersonalController } from './personal.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Personal, PersonalSchema } from './schemas/personal.schema';
import { HttpModule } from '@nestjs/axios';
import { Schedule, ScheduleSchema } from 'src/schedule/schemas/schedule.schema';
// import { ScheduleModule } from 'src/schedule/schedule.module';
import { AppScheduleModule } from 'src/schedule/schedule.module';
import { Charge, ChargeSchema } from 'src/charge/schemas/charge.schema';
import { ChargeModule } from 'src/charge/charge.module';

@Module({
  controllers: [PersonalController],
  providers: [PersonalService],
  imports: [ 
    MongooseModule.forFeature([
      {
        name: Personal.name,
        schema: PersonalSchema
      },
      {
        name: Charge.name,
        schema: ChargeSchema
      },
      {
        name: Schedule.name, 
        schema: ScheduleSchema
      }
    ]),
    ChargeModule,
    AppScheduleModule,
    HttpModule
  ],
  exports: [
    PersonalService
  ]
})
export class PersonalModule {}
