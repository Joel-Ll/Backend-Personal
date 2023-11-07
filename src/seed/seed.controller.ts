import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) { }

  @ApiTags('Semilla')
  @ApiOperation({
    summary: 'Genera datos de Semilla para Personal',
    description: 'Genera datos de semilla de personal para pruebas de rendimiento'
  })
  @Get()
  executeSeed() {
    this.seedService.runSeed()
  }
}
