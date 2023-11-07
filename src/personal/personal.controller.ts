import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { PersonalService } from './personal.service';
import { CreatePersonalDto } from './dto/create-personal.dto';
import { UpdatePersonalDto } from './dto/update-personal.dto';
import { HttpService } from '@nestjs/axios';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FilterDto } from 'src/common/dto/filter.dto';

@Controller('personal')
export class PersonalController {
  constructor(
    private readonly personalService: PersonalService,
    private httpService: HttpService
  ) { }

  @ApiTags('personal')
  @ApiOperation({ 
    summary: 'Registro de personal', 
    description: 'Registra un personal con todos sus parametros' 
  })
  @Post()
  create(@Body() createPersonalDto: CreatePersonalDto) {
    return this.personalService.create(createPersonalDto);
  }

  @ApiTags('personal')
  @ApiOperation({ 
    summary: 'Obtener Registros de Personal', 
    description: 'Obtiene todos los registros del personal' 
  })
  @Get()
  findAll() {
    return this.personalService.findAll();
  }

  // @ApiTags('personal')
  // @ApiOperation({ 
  //   summary: 'Obtener todo el registro de personales activos', 
  //   description: 'Obtiene todos los registros del personal activo' 
  // })
  // @Get('actives')
  // findAllActive() {
  //   return this.personalService.findAllActive();
  // }

  @ApiTags('personal')
  @ApiOperation({
    summary: 'Obtener Registro por ID',
    description: 'Obtiene un registro especifico por su ID'
  })

  // @ApiTags('personal')
  // @ApiOperation({
  //   summary: 'Obtener Registros por paginacion',
  //   description: 'Obtiene los registros del personal por paginacion'
  // })
  // @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  // @ApiQuery({ name: 'page', type: Number, example: 1, required: false })
  // @Get('pagination')
  // findAllPaginate(@Query() paginationDto: PaginationDto) {
  //   return this.personalService.findAllPaginate(paginationDto);
  // }

  @ApiTags('personal')
  @ApiOperation({
    summary: 'Obtener registros por filtrado de parametros',
    description: 'Realiza la busqueda de registros por el filtrado'
  })
  @ApiQuery({ name: 'name', type: String,  required: false })
  @ApiQuery({ name: 'lastName', type: String,  required: false })
  @ApiQuery({ name: 'fullName', type: String,  required: false })
  @ApiQuery({ name: 'ci', type: String,  required: false })
  @ApiQuery({ name: 'email', type: String,  required: false })
  @ApiQuery({ name: 'phone', type: String,  required: false })
  @ApiQuery({ name: 'address', type: String,  required: false })
  @ApiQuery({ name: 'isActive', type: String,  required: false })
  @ApiQuery({ name: 'nationality', type: String,  required: false })
  @ApiQuery({ name: 'isActive', type: String, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @Get('filtered')
  async filterParams(@Query() filterDto: FilterDto) {
    if (typeof filterDto.isActive === 'string') {
      filterDto.isActive = filterDto.isActive === 'true';
    }
    return await this.personalService.filterParams(filterDto);
  }

  @ApiTags('personal')
  @ApiOperation({
    summary: 'Obtener Registro de personal por ID',
    description: 'Obtiene la informacion especifica de un personal por su ID'
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personalService.findOne(id);
  }

  @ApiTags('personal')
  @ApiOperation({
    summary: 'Obtener Registro de personal por ID de Cargo',
    description: 'Obtiene todos los usuarios con un respectivo cargo'
  })
  @Get('user-charge/:id')
  async findUsersCharge(@Param('id') id: string) {
    return await this.personalService.findUsersByCharge(id);
  }

  @ApiTags('personal')
  @ApiOperation({
    summary: 'Obtener Registro de personal por ID de horario',
    description: 'Obtiene todos los usuarios con un respectivo'
  })
  @Get('user-schedule/:id')
  async findUsersSchedule(@Param('id') id: string) {
    return await this.personalService.findUsersBySchedule(id);
  }

  @ApiTags('personal')
  @ApiOperation({
    summary: 'Editar Registro por ID',
    description: 'Edita un registro especifico por su ID'
  })
  @Put('edit/:id')
  update(@Param('id') id: string, @Body() updatePersonalDto: UpdatePersonalDto) {
    return this.personalService.update(id, updatePersonalDto);
  }

  @ApiTags('personal')
  @ApiOperation({
    summary: 'Elimina informacion de personal',
    description: 'Elimina los datos de prueba de Personal'
  })
  @Delete('delete-all-personal')
  deleteUsers() {
    return this.personalService.delete()
  }
}
