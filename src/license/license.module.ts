import { Module } from '@nestjs/common';
import { LicenseService } from './license.service';
import { LicenseController } from './license.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { License, LicenseSchema } from './schema/license.schema';

@Module({
  controllers: [LicenseController],
  providers: [LicenseService],
  imports: [
    MongooseModule.forFeature([
      {
        name: License.name,
        schema: LicenseSchema
      }
    ])
  ],
  exports: [
    LicenseService
  ]
  
})
export class LicenseModule {}
