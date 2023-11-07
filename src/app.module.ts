// import { ApiModule } from './api/api.module';
// import { ConfigModule } from '@nestjs/config';
// import { PersonalModule } from './personal/personal.module';
// import { MongooseModule } from '@nestjs/mongoose';
// import { CommonModule } from './common/common.module';
// import { ChargeModule } from './charge/charge.module';
// import { ScheduleModule } from './schedule/schedule.module';
// import { SpecialScheduleModule } from './special-schedule/special-schedule.module';
// import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { MongooseModule } from '@nestjs/mongoose';
// import { PersonalModule } from './personal/personal.module';
// import { ScheduleModule } from './schedule/schedule.module';
// import { CommonModule } from './common/common.module';
// import { ChargeModule } from './charge/charge.module';
// import { ApiModule } from './api/api.module';
// import { AttendanceControlModule } from './attendance-control/attendance-control.module';
// // import { ScheduleModule } from '@nestjs/schedule';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       envFilePath: '.env',
//       isGlobal: true
//     }),
//     MongooseModule.forRoot('mongodb://localhost:27018/control-personal-v1'),
//     PersonalModule,
//     ScheduleModule,
//     CommonModule,
//     ChargeModule,
//     ApiModule,
//     AttendanceControlModule,
//   ]
// })


// export class AppModule { }


import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { PersonalModule } from './personal/personal.module';
import { AppScheduleModule } from './schedule/schedule.module'; // Renombré tu módulo personalizado para evitar confusiones
import { CommonModule } from './common/common.module';
import { ChargeModule } from './charge/charge.module';
import { ApiModule } from './api/api.module';
import { GenerateReportModule } from './generate-report/generate-report.module';
import { AttendanceControlModule } from './attendance-control/attendance-control.module';
import { SeedModule } from './seed/seed.module';
import { LicenseModule } from './license/license.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    MongooseModule.forRoot('mongodb://localhost:27018/control-personal-v1'),
    PersonalModule,
    AppScheduleModule,  // Usa el nombre modificado aquí
    CommonModule,
    ChargeModule,
    ApiModule,
    AttendanceControlModule,
    GenerateReportModule, // Añade esta línea
    SeedModule, LicenseModule,
  ],
})
export class AppModule { }