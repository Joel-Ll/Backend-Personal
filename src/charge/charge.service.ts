import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { CreateChargeDto } from './dto/create-charge.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Charge } from './schemas/charge.schema';
import { Model } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FilterChargeDto } from 'src/common/dto/filter.dto';

@Injectable()
export class ChargeService {
  private defaultLimit: number = 10;
  constructor(
    @InjectModel( Charge.name )
    private readonly chargeModel: Model<Charge>
  ) {} 

  async create(createChargeDto: CreateChargeDto) {
    try {
      const charge = await this.chargeModel.create( createChargeDto );
      return charge;
    } catch (error) {
      console.log( error );
    }
  }

  async findAll() {
    const charges = await this.chargeModel.find();
    return charges; 
  }

  // async findAllPaginate(paginationDto: PaginationDto) {
  //   const { limit = this.defaultLimit, page = 1 } = paginationDto;

  //   const offset = (page - 1) * limit;

  //   const charges = await this.chargeModel.find()
  //     .limit(limit)
  //     .skip(offset)
  //     .select('-__v');

  //   const total = await this.chargeModel.countDocuments().exec();

  //   return {
  //     data: charges,
  //     total: total,
  //     totalPages: Math.ceil(total / limit)
  //   };
  // }

  async filterParams(filterChargeDto: FilterChargeDto) {
    const { name, isActive, limit = this.defaultLimit, page = 1 } = filterChargeDto;

    const filters: any = {}

    if( name )  filters.name = new RegExp(name, 'i')
    if (isActive !== undefined) filters.isActive = isActive;

    const offset = (page - 1) * limit;

    const charges =  await this.chargeModel.find(filters)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip( offset )
      .select('-__v')

    const total = await this.chargeModel.countDocuments(filters).exec()

    return {
      data: charges,
      total,
      totalPages: Math.ceil(total / limit )
    }

    
    // let query = this.chargeModel.find();

    // if (name) {
    //   query = query.where('name', new RegExp(name, 'i'));
    // }

    // if (isActive) {
    //   query = query.where('isActive', isActive);
    // }

    // console.log("filterChargeDto:", filterChargeDto);

    // const result = await query.exec();

    // console.log("Result:", result);

    // return result;
  }


  async findOne(id: string) {
    try {
      const charge = await this.chargeModel.findById({_id: id})
      return charge 
    } catch (error) {
      throw new BadRequestException('Not found charge');
    }
  }

  async update(id: string, updateChargeDto: UpdateChargeDto) {
    const chargeUpdate = await this.findOne( id );
    try {
      await chargeUpdate.updateOne( updateChargeDto );
      return { ...chargeUpdate.toJSON(), ...updateChargeDto }
    } catch (error) {
      throw new BadRequestException('No se pudo actualizar el cargo');
    }
  }

  async delete() {
    await this.chargeModel.deleteMany({}).exec();
  }
}
