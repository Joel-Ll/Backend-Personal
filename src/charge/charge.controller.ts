import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ChargeService } from './charge.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FilterChargeDto, FilterDto } from 'src/common/dto/filter.dto';

@ApiTags('cargos')
@Controller('charge')
export class ChargeController {
  constructor(private readonly chargeService: ChargeService) {}

  @ApiTags('cargos')
  @ApiOperation({ 
    summary: 'Registro de Cargo', 
    description: 'Registra un cargo con todos sus parametros' 
  })
  @Post()
  create(@Body() createChargeDto: CreateChargeDto) {
    return this.chargeService.create(createChargeDto);
  }

  @ApiTags('cargos')
  @ApiOperation({ 
    summary: 'Obtener Registros de Cargo', 
    description: 'Obtiene todos los registros de Cargos' 
  })
  @Get()
  findAll() {
    return this.chargeService.findAll();
  }

  // @ApiTags('cargos')
  // @ApiOperation({
  //   summary: 'Obtener Registros por paginacion',
  //   description: 'Obtiene los registros del cargo por paginacion'
  // })
  // @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  // @ApiQuery({ name: 'page', type: Number, example: 1, required: false })
  // @Get('pagination')
  // findAllPaginate(@Query() paginationDto: PaginationDto) {
  //   return this.chargeService.findAllPaginate(paginationDto);
  // }

  @ApiTags('cargos')
  @ApiOperation({
    summary: 'Obtener registros por filtrado de parametros',
    description: 'Realiza la busqueda de cargos por el filtrado'
  })
  @ApiQuery({ name: 'name', type: String, required: false })
  @ApiQuery({ name: 'isActive', type: String, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @Get('filtered')
  async filterParams(@Query() filterChargeDto: FilterChargeDto) {
    if (typeof filterChargeDto.isActive === 'string') {
      filterChargeDto.isActive = filterChargeDto.isActive === 'true';
    }
    return await this.chargeService.filterParams(filterChargeDto);
  }

  @ApiTags('cargos')
  @ApiOperation({
    summary: 'Obtener Registro de Cargo por ID',
    description: 'Obtiene la informacion especifica de un cargo por su ID'
  })
  @ApiTags('cargos')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chargeService.findOne(id);
  }

  @ApiTags('cargos')
  @ApiOperation({
    summary: 'Editar Cargo por ID',
    description: 'Edita un cargo especifico por su ID'
  })
  @Put(':id')
  update(@Param('id') id: string, @Body() updateChargeDto: UpdateChargeDto) {
    return this.chargeService.update(id, updateChargeDto);
  }
}
