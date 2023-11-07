import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { LicenseService } from './license.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FilterLicenseDto } from 'src/common/dto/filter.dto';

@ApiTags('Licencias')
@Controller('license')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}
  
  @Post()
  assignLicense(@Body() createLicenseDto: CreateLicenseDto) {
    return this.licenseService.assignLicense(createLicenseDto);
  }

  @Get('licenses-person/:id')
  async findAll(@Param('id') id: string) {
    return this.licenseService.findAll(id);
  }

  @ApiTags('Licencias')
  @ApiOperation({
    summary: 'Obtener registros por filtrado de parametros',
    description: 'Realiza la busqueda de licencias por el filtrado'
  })
  @ApiQuery({ name: 'licenseType', type: String,  required: false })
  @ApiQuery({ name: 'isActive', type: String, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @Get('filtered')
  async filterParams(@Query() filterLicenseDto: FilterLicenseDto) {
    if (typeof filterLicenseDto.isActive === 'string') {
      filterLicenseDto.isActive = filterLicenseDto.isActive === 'true';
    }
    return await this.licenseService.filterParams(filterLicenseDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.licenseService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateLicenseDto: UpdateLicenseDto) {
    return this.licenseService.update(id, updateLicenseDto);
  }

  @Delete('delte-all-licenses')
  remove() {
    return this.licenseService.remove();
  }
}
