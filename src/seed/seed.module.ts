import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { PersonalModule } from 'src/personal/personal.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [ PersonalModule ]
})
export class SeedModule {}
