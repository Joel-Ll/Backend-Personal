import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FilterScheduleDto } from 'src/common/dto/filter.dto';
// import { Cron } from '@nestjs/schedule';

@ApiTags('horarios')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) { }

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get()
  findAll() {
    return this.scheduleService.findAll();
  }

  @ApiTags('horarios')
  @ApiOperation({
    summary: 'Obtener registros por filtrado de parametros',
    description: 'Realiza la busqueda de horarios por el filtrado'
  })
  @ApiQuery({ name: 'name', type: String, required: false })
  @ApiQuery({ name: 'isActive', type: String, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @Get('filtered')
  async filterParams(@Query() filterScheduleDto: FilterScheduleDto) {
    if (typeof filterScheduleDto.isActive === 'string') {
      filterScheduleDto.isActive = filterScheduleDto.isActive === 'true';
    }
    return await this.scheduleService.filterParams(filterScheduleDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
    return this.scheduleService.update(id, updateScheduleDto);
  }

  @Put('main/:id/deactivate')
  deactivateMainSchedule(@Param('id') id: string) {
    return this.scheduleService.deactivateMainSchedule(id);
  }

  @Put('main/:id/active')
  activateMainSchedule(@Param('id') id: string) {
    return this.scheduleService.activateMainSchedule(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(id);
  }

}
