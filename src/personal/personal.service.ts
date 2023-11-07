import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePersonalDto } from './dto/create-personal.dto';
import { UpdatePersonalDto } from './dto/update-personal.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Personal } from './schemas/personal.schema';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FilterDto } from 'src/common/dto/filter.dto';
import axios from 'axios';
import { Schedule } from 'src/schedule/schemas/schedule.schema';
import { Charge } from 'src/charge/schemas/charge.schema';

@Injectable()
export class PersonalService {
  private defaultLimit: number = 10;

  constructor(
    @InjectModel(Personal.name)
    private readonly personalModel: Model<Personal>,

    @InjectModel(Charge.name)
    private readonly chargeModel: Model<Charge>,

    @InjectModel(Schedule.name)
    private readonly ScheduleModel: Model<Schedule>,

    private httpService: HttpService
  ) { }


  async create(createPersonalDto: CreatePersonalDto) {
    const { file, unity, charge, schedule, } = createPersonalDto;

    if (file) {
      const mime = file.split(';')[0].split(':')[1];
      const base64 = file.split(',')[1];

      const fileObj = { mime, base64 };
      try {
        const res = await this.httpService.post(`${process.env.API_FILE}/files/upload`, { file: fileObj }).toPromise();
        if (!res) {
          throw new BadRequestException('File not found');
        }
        createPersonalDto = { ...createPersonalDto, file: res.data.file._id }
        // console.log(createPersonalDto);
      } catch (error) {
        console.log(error);
      }
    }

    let entities: [];
    try {
      const response = await axios.get(`${process.env.API_UNITYS}/api/departments/departments`);
      entities = response.data;
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving entities');
    }

    const entityName = this.getEntityName(entities, createPersonalDto.unity);
    if (!entityName) {
      throw new BadRequestException('Entity not found');
    }
    createPersonalDto = { ...createPersonalDto, unity: entityName };

    // try {
    //   const entities = await axios.get(`${process.env.API_UNITYS}/api/departments/departments`);

    //   const entityName = this.getEntityName(entities.data, unity);
    //   if (entityName !== '') {
    //     createPersonalDto = { ...createPersonalDto, unity: entityName }
    //   } else {
    //     throw new BadRequestException('Entity not found');
    //   }

    // } catch (error) {
    //   console.log(error);
    // }

    if (charge && !(await this.isChargeExist(charge))) {
      throw new BadRequestException(`The specified charge does not exist: ${charge}`);
    }

    if (schedule && !(await this.isScheduleExists(schedule))) {
      throw new BadRequestException(`The specified schedule does not exist: ${schedule}`);
    }

    try {
      const personal = await this.personalModel.create(createPersonalDto);
      return personal;
    } catch (error) {
      if (error.code === 11000) {
        const duplicateKey = Object.keys(error.keyValue)[0];
        const duplicateValue = error.keyValue[duplicateKey];
        throw new BadRequestException(`El personal ya existe con el ${duplicateKey}: ${duplicateValue}`);
      }
      throw new InternalServerErrorException('Please check logs server');
    }
  }

  async findAll() {
    const personals = await this.personalModel.find({})
      .sort({ createdAt: -1 })
    const count = await this.personalModel.estimatedDocumentCount();
    if (count === 0) {
      return personals;
    }


    for (const personal of personals) {
      if (personal.file) {
        try {
          const res = await this.httpService.get(`${process.env.API_FILE}/file/${personal.file}`).toPromise();
          personal.file = res.data.file._id;
        } catch (error) {
          console.log('error', error);
        }
      }
    }
    return personals;
  }

  // async findAllActive() {
  //   try {
  //     const personals = await this.personalModel.find({ isActive: true });
  //     for (const personal of personals) {
  //       if (personal.file) {
  //         try {
  //           const res = await this.httpService.get(`${process.env.API_FILE}/file/${personal.file}`).toPromise();
  //           personal.file = res.data.file;
  //         } catch (error) {
  //           throw error.response?.data
  //         }
  //       }
  //     }
  //     return personals;
  //   } catch (error) {
  //     throw new BadRequestException(`Paso algo en el servidor`);
  //   }
  // }

  async findOne(id: string) {
    const personal = await this.personalModel.findById(id);
    if (!personal) {
      throw new BadRequestException(`El personal con el id: ${id} no existe`);
    }

    if (personal.file) {
      try {
        const res = await this.httpService.get(`${process.env.API_FILE}/file/${personal.file}`).toPromise();
        personal.file = res.data.file;
      } catch (error) {
        console.log(error);
      }
    }
    return personal;
  }

  // async findAllPaginate(paginationDto: PaginationDto) {
  //   const { limit = this.defaultLimit, page = 1 } = paginationDto;

  //   const offset = (page - 1) * limit;

  //   const personals = await this.personalModel.find()
  //     .limit(limit)
  //     .skip(offset)
  //     .select('-__v');

  //   for (const personal of personals) {
  //     if (personal.file) {
  //       try {
  //         const res = await this.httpService.get(`${process.env.API_FILE}/file/${personal.file}`).toPromise();
  //         personal.file = res.data.file._id;
  //       } catch (error) {
  //         throw error.response?.data
  //       }
  //     }
  //   }

  //   const total = await this.personalModel.countDocuments().exec();

  //   return {
  //     data: personals,
  //     total: total,
  //     totalPages: Math.ceil(total / limit)
  //   };
  // }

  async filterParams(filterDto: FilterDto) {
    const { name, lastName, fullName, ci, email, nationality,
      phone, address, isActive, limit = this.defaultLimit,
      page = 1 } = filterDto;

    const filters: any = {};

    if (name) filters.name = new RegExp(name, 'i');
    if (lastName) filters.lastName = new RegExp(lastName, 'i');

    if (fullName) {
      const [name, lastName] = fullName.split(' ');

      filters.$or = [
        { $and: [{ name: new RegExp(name, 'i') }, { lastName: new RegExp(lastName, 'i') }] },
        { $and: [{ name: new RegExp(lastName, 'i') }, { lastName: new RegExp(name, 'i') }] }
      ];
    }

    if (ci) filters.ci = ci;

    if (email) {
      if (email.includes('@')) {
        filters.email = new RegExp(email, 'i')
      } else {
        return [];
      }
    }
    if (nationality) filters.nationality = new RegExp(nationality, 'i');

    if (phone) filters.phone = phone;

    if (address) filters.address = new RegExp(address, 'i');

    if (isActive !== undefined) filters.isActive = isActive;

    const offset = (page - 1) * limit;

    const personals = await this.personalModel.find(filters)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .select('-__v')

    // let countPages 

    const total = await this.personalModel.countDocuments(filters).exec();

    for (const personal of personals) {
      if (personal.file) {
        try {
          const res = await this.httpService.get(`${process.env.API_FILE}/file/${personal.file}`).toPromise();
          personal.file = res.data.file;
        } catch (error) {
          console.error("Error fetching file:", error);
          throw error.response?.data
        }
      }
    }

    return {
      data: personals,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }

  // Arreglar la parte de busqueda cargo con sus imagenes.
  async findUsersByCharge(chargeId: string) {
    return await this.personalModel.find({ charge: chargeId }).exec();
  }

  async findUsersBySchedule(scheduleId: string): Promise<Personal[]> {
    return await this.personalModel.find({ schedule: scheduleId }).exec();
  }

  async update(id: string, updatePersonalDto: UpdatePersonalDto) {
    const personalId = await this.personalModel.findById(id);

    if (!personalId) {
      throw new BadRequestException('Personal no encontrado');
    }

    const { file, unity } = updatePersonalDto;

    if (file && file.startsWith('data')) {
      const mime = file.split(';')[0].split(':')[1];
      const base64 = file.split(',')[1];

      const fileObj = { mime, base64 };
      if (personalId.file) {
        try {
          const res = await this.httpService.post(`${process.env.API_FILE}/files/upload`, { file: fileObj }).toPromise();
          updatePersonalDto = { ...updatePersonalDto, file: res.data.file._id }
        } catch (error) {
          console.log(error);
        }
      } else {
        const mime = file.split(';')[0].split(':')[1];
        const base64 = file.split(',')[1];
        const fileObj = { mime, base64 };

        try {
          const res = await this.httpService.post(`${process.env.API_FILE}/files/upload`, { file: fileObj }).toPromise();
          updatePersonalDto = { ...updatePersonalDto, file: res.data.file._id }

        } catch (error) {
          console.log(error);
        }
      }
    } else {
      updatePersonalDto.file = personalId.file;
    }

    if (unity) {
      if (personalId.unity) {
        try {
          const entities = await axios.get(`${process.env.API_UNITYS}/api/departments/departments`);
          const entityName = this.getEntityName(entities.data, unity);
          if (entityName === '') {
            throw new BadRequestException('Entity not found');
          }
          updatePersonalDto = { ...updatePersonalDto, unity: entityName }
        } catch (error) {
          console.log(error);
        }
      } else {
        updatePersonalDto.unity = personalId.unity;
      }
    }

    try {
      // const personal = await this.personalModel.create(createPersonalDto);
      return await this.personalModel.findByIdAndUpdate(id, updatePersonalDto, { new: true });
      // console.log('personal', personal)
      // return personal;
    } catch (error) {
      if (error.code === 11000) {
        // Manejo de errores con la estructura proporcionada
        throw new BadRequestException(`No se puede editar el valor porque ya existe ${JSON.stringify(error.keyValue)}`);
      }
      throw new InternalServerErrorException('Por favor revise el servidor');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} personal`;
  }

  // Funciones axuiliares
  private getEntityName(entities: any[], entityId: string): string {
    const entity = entities.find(e => e._id === entityId);
    return entity ? entity.name : "";
  }

  // } else if (entity.children && entity.children.length > 0) {
  //   const childEntityName = this.getEntityName(entity.children, entityId);
  //   if (childEntityName) {
  //     return childEntityName;
  //   }

  private async isChargeExist(chargeId: string) {
    const charge = await this.chargeModel.findById(chargeId).exec();
    return !!charge;
  }

  private async isScheduleExists(ScheduleId: string) {
    const schedule = await this.ScheduleModel.findById(ScheduleId).exec();
    return !!schedule
  }

  async delete() {
    await this.personalModel.deleteMany({}).exec();
  }
}
