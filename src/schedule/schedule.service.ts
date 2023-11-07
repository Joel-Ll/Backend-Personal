import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './schemas/schedule.schema';
import { Cron } from '@nestjs/schedule';
import { FilterScheduleDto } from 'src/common/dto/filter.dto';

@Injectable()
export class ScheduleService {
  private defaultLimit: number = 10;
  constructor(
    @InjectModel(Schedule.name)
    private scheduleModel: Model<Schedule>
  ) { }

  // Funcion para crear un horario
  async create(createScheduleDto: CreateScheduleDto) {
    try {
      const schedule = await this.scheduleModel.create(createScheduleDto);
      return schedule
    } catch (error) {
      console.log(error)
      throw new BadRequestException('No se pudo crear el horario');
    }
  }

  // Funcion para listar todos los horarios creados
  async findAll() {
    const scheduls = await this.scheduleModel.find();
    return scheduls;
  }

  // Buscar horarios pod id
  async findOne(id: string) {
    try {
      const schedule = await this.scheduleModel.findById({ _id: id })
      return schedule
    } catch (error) {
      throw new BadRequestException('Not found schedule');
    }
  }

  async filterParams( filterScheduleDto: FilterScheduleDto ) {
    const { name, isActive, limit = this.defaultLimit, page = 1 } = filterScheduleDto;

    const filters: any = {}

    if( name ) filters.name = new RegExp(name, 'i');
    if( isActive !== undefined ) filters.isActive = isActive;

    const offest = ( page - 1 ) * limit;

    const schedules = await this.scheduleModel.find( filters )
      .sort({ createdAt: -1 })
      .limit( limit )
      .skip( offest )
      .select('-__v')

    const total = await this.scheduleModel.countDocuments(filters).exec()

    return {
      data: schedules,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }


  // Actualizacion del horario principal
  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    const scheduleUpdate = await this.findOne( id );
    try {
      await scheduleUpdate.updateOne( updateScheduleDto )
      return { ...scheduleUpdate.toJSON(), ...updateScheduleDto}
    } catch (error) {
      throw new BadRequestException('No se pudo actualizar el horario');
    }
  }

  // Dar de baja a un horario principal 
  async deactivateMainSchedule(id: string) {
    try {
      const schedule = await this.scheduleModel.findById(id);
      schedule.isActive = false;
      await schedule.save();

    } catch (error) {
      throw new BadRequestException(`No se encontro el horario con el id: ${id}`)
    }
  }

  // Dar de baja a umn horario especial
  async activateMainSchedule(id: string) {
    const schedule = await this.scheduleModel.findById(id);
    if (schedule && schedule.isActive === false) {
      schedule.isActive = true;
    } else {
      throw new BadRequestException(`El horario con el id: ${id} ya se encuentra activo`)
    }
  }

  // Eliminacion de un horario
  async remove(id: string) {
    try {
      await this.scheduleModel.findByIdAndRemove(id).exec();

    } catch (error) {
      throw new NotFoundException(`Schedule with ID ${id} not found.`);

    }
  }

  async deactivateExpiredDateRanges() {

    const now = new Date();
    const currentDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    const schedules = await this.scheduleModel.find({
      isActive: true,
      'scheduleSpecial.dateRange.1': { $lt: currentDate }
    });

    for (const schedule of schedules) {
      for (const special of schedule.scheduleSpecial) {
        if (special.dateRange && special.dateRange[1] < currentDate) {
          special.isActive = false;
        }
      }
      await schedule.save();
    }
  }

  // Actualiza la base de datos una vez por dia (Comprueba la fecha actual con las fechas de expiracion para desactivar los dias)
  @Cron('0 8 * * 1-6')
  async handleInactiveDateRanges() {
    console.log('Cron job started.');
    await this.deactivateExpiredDateRanges();
    console.log('Cron job finished.');
  }
}
