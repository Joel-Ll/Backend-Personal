import { Module } from '@nestjs/common';
import { ChargeService } from './charge.service';
import { ChargeController } from './charge.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Charge, ChargeSchema } from './schemas/charge.schema';

@Module({
  controllers: [ChargeController],
  providers: [ChargeService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Charge.name,
        schema: ChargeSchema
      }
    ])
  ]
})
export class ChargeModule {}
