import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { InjectModel } from '@nestjs/mongoose';
import { License } from './schema/license.schema';
import { Model } from 'mongoose';
import { FilterLicenseDto } from 'src/common/dto/filter.dto';

@Injectable()
export class LicenseService {
  private defaultLimit: number = 10;
  constructor(
    @InjectModel(License.name)
    private readonly licenseModel: Model<License>
  ) { }

  async assignLicense(createLicenseDto: CreateLicenseDto) {
    // Validacion:  si ya existe un licencia para tal fecha  no puede crearse dos licencias en esa misma fecha...
    try {
      const license = await this.licenseModel.create(createLicenseDto);
      return license;

    } catch (error) {
      throw new BadRequestException(error.message);
    } 
  }

  async findAll( personal: string ) {
    const license = await this.licenseModel.find({personal})
      .sort({ createdAt: -1 })

    if( license ) {
      return license;
    } else {
      throw new BadRequestException('No hay registros asignados')
    }
  }

  async filterParams( filterLicenseDto :FilterLicenseDto ) {
    const { licenseType, isActive, limit = this.defaultLimit, page = 1 } = filterLicenseDto
    
    const filters: any = {}

    if( licenseType ) filters.licenseType = new RegExp( licenseType, 'i');
    if( isActive !== undefined ) filters.isActive = isActive;
    
    const offset = (page - 1) * limit
    
    const licenses = await this.licenseModel.find( filters )
      .sort({ createdAt: -1 })
      .limit( limit )
      .skip( offset )
      .select('-__v')

    const total = await this.licenseModel.countDocuments(filters).exec();

    return {
      data: licenses,
      total,
      totalPages: Math.ceil( total / limit )
    }
  }

  async findOne(personalId: string) {
    try {
      const license = await this.licenseModel.findOne({ personalId }).exec();
      return license 
    } catch (error) {
      throw new BadRequestException('Not found license');
    }
  }

  async update(id: string, updateLicenseDto: UpdateLicenseDto) {
    const licenseUpdate = await this.findOne( id );
    try {
      await licenseUpdate.updateOne( updateLicenseDto );
      return { ...licenseUpdate.toJSON(), ...updateLicenseDto }
    } catch (error) {
      throw new BadRequestException('No se pudo actualizar la licencia');
    }
  }

  async remove() {
    await this.licenseModel.deleteMany({}).exec();
  }
}
