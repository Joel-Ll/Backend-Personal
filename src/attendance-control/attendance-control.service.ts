import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAttendanceControlDto } from './dto/create-attendance-control.dto';
import { UpdateAttendanceControlDto } from './dto/update-attendance-control.dto';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Personal } from 'src/personal/schemas/personal.schema';
import { Model } from 'mongoose';
import { Schedule } from 'src/schedule/schemas/schedule.schema';
import { PersonalAttendance } from './schemas/attendance-control.schema';
import { AttendanceStatus, ControlPoints, DateTimeInfo } from './interfaces/DateTimeInfo.interface';
// import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import { GenerateReportService } from 'src/generate-report/generate-report.service';
import { throwError } from 'rxjs';
import { FilterReportAttendace } from 'src/common/dto/filter.dto';
import { convertToISOFormat, formatDate, getDaysArrayByWeek, isDayInSchedule, userAssignedToSpecialSchedule } from 'src/attendance-control/helpers'
import { type } from 'os';
import { LicenseService } from 'src/license/license.service';
import { lineCap } from 'pdfkit';




@Injectable()
export class AttendanceControlService {

  // private reportTemplate: HandlebarsTemplateDelegate;
  constructor(
    private readonly generateReportAttendance: GenerateReportService,
    private readonly licenseService: LicenseService,

    @InjectModel(PersonalAttendance.name)
    private readonly personalAttendanceModel: Model<PersonalAttendance>,


    @InjectModel(Personal.name)
    private readonly personalModel: Model<Personal>,

    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<Schedule>,
  ) {

    // const templatePath = '/home/joel/Escritorio/control-personal-2/control-personal-v1/src/attendance-control/reportTemplate.html';
    // const source = fs.readFileSync(templatePath, 'utf-8');

    // this.reportTemplate = Handlebars.compile(source);
  }

  create(createAttendanceControlDto: CreateAttendanceControlDto) {
    return 'This action adds a new attendanceControl';
  }

  async findAll(): Promise<PersonalAttendance[]> {
    return await this.personalAttendanceModel.find().exec();
  }

  /*
    Funcion para generar los reportes de acuerdo a la fecha establecida 
    con los parametros de busqueda de fecha Inicial - Fecha Final - IdPersonal
  */
  async findReportAttendance(filterReportAttendace: FilterReportAttendace) {
    const { initialDate, endDate, personalId } = filterReportAttendace;

    const initialDateObj = new Date(initialDate);
    const endDateObj = new Date(endDate);
    const { attendanceDetail } = await this.findOne(personalId);
    console.log({ attendanceDetail });
    let attendanceReport = [];

    // Validacion de fechas
    if (endDateObj < initialDateObj) {
      throw new BadRequestException('La fecha de inicio no puede ser posterior a la fecha de fin');
    }

    if (isNaN(initialDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      throw new BadRequestException("Una o ambas fechas son inválidas.");
    }

    // Obtenemos el registro del personal "personalId" con su primer fecha de registro y lo convertimos de tipo date
    const initDate = attendanceDetail[0].date;
    console.log({ initDate });
    const dateIsoInit = convertToISOFormat(initDate);
    console.log( { dateIsoInit } )

    // Obtenemos la fecha actual
    const { date } = this.getCurrentDateTimeInfo();
    console.log({ date });

    // Validamos si las fechas de consultas se encuentran en los registros... Se tiene el siguiente ej

    /*
      |------------------------- Linea de tiempo -----------------------------|
      [Inicio (primer registro)]                                               [Fecha actual]
          |---------------------- Consulta válida --------------------|
          [Fecha inicio consulta]                                      [Fecha fin consulta]
    */


    // const validDate = initialDateObj >= dateIsoInit && endDateObj <= date;

    // if (!validDate) {
    //   throw new BadRequestException('No hay registros para la fecha seleccionada')
    // }

    /*
      En este punto tenemos las fechas de consulta que se encuentran en los registros...

      Extraer toda la infomacion del personal
      1. Informacion de licencias para el personal
      2. Informacion del horario al que pertence ... Horario normal y especial 
    */

    // Informacion de licencias del personal
    const license = await this.licenseService.findAll(personalId);
    // console.log(license);

    // Obtener información del horario del personal...
    const { schedule } = await this.personalModel.findById(personalId);
    const scheduleInfo = await this.scheduleModel.findById(schedule);
    // console.log( scheduleInfo ); 

    // Obtener todos los días laborables como números de la semana en el rango de fechas
    const daysOfWeek = getDaysArrayByWeek(initialDateObj, endDateObj);

    // Iterar sobre todos los días laborables
    daysOfWeek.forEach(({ date, dayOfWeek }) => {
      const formattedDate = formatDate(date);
    
      let scheduleToCheck = 'Horario normal';

      const attendanceRecord = attendanceDetail.find(detail => detail.date === formattedDate);
      console.log( { attendanceRecord });

      // Primero verificamos si el día pertenece a un horario especial
      if (isDayInSchedule(dayOfWeek, scheduleInfo.scheduleSpecial) && userAssignedToSpecialSchedule(personalId, scheduleInfo.scheduleSpecial)) {
        scheduleToCheck = 'Horario especial';
      } 
      
      const reportItem: any = {
        date: formattedDate,
        type: attendanceRecord ? 'Asistencia' : 'Inasistencia',
        entrances: attendanceRecord?.entrances || [],
        exits: attendanceRecord?.exits || [],
      };

      if (scheduleToCheck === 'Horario especial') {
        reportItem.specialDay = scheduleToCheck;
      }

      attendanceReport.push(reportItem);
    });
    return attendanceReport;
  }


  async findOne(personalId: string) {
    const attendancePersonal = await this.personalAttendanceModel.findOne({ personalId }).exec();

    if (attendancePersonal) {
      return attendancePersonal;
    } else {
      throw new BadRequestException('No se encontro un registro')
    }
  }

  update(id: number, updateAttendanceControlDto: UpdateAttendanceControlDto) {
    return `This action updates a #${id} attendanceControl`;
  }

  async remove() {
    await this.personalAttendanceModel.deleteMany({}).exec();
  }

  // Funcion Principal -> Reconocemos al personal con una imagen llamando la funcion "sendImageToRecognitionSystem"
  async registerAttendance(base: string) {
    const userId = await this.sendImageToRecognitionSystem(base);
    if (!userId) {
      throw new BadRequestException('No se pudo reconocer al usuario.');
    }

    // Funcion que recibe el id obtenido por sendImageToRecognitionSystem
    const { name } = await this.processAttendance(userId);

    return {
      userId,
      message: `Hola ${name}tu registro se realizó correctamente`
    }
  }

  // Funcion que recibe la imagen y retorn a un id de personal 
  private async sendImageToRecognitionSystem(base: string): Promise<string | null> {
    try {
      // const response = await axios.post(`http://10.10.214.189:8000/`, { base });
      // if (response.data && response.data.name) {
      //   return response.data.name;
      // } else {
      //   return null;
      // }
      await new Promise(resolve => setTimeout(resolve, 1000));
      // 65372fe486748e7e93bc75b4
      return '65405a307f98668e51679ba2';
    } catch (error) {
      throw new BadRequestException('No se pudo mandar la imagen, intentelo de nuevo')
    }
  }

  // Funcion que recibe el id e indentifica al personal del sistema
  private async processAttendance(userId: string) {
    const user = await this.personalModel.findById(userId);

    if (!user) {
      throw new BadRequestException('No se encontró el personal');
    }
    await this.processSchedule(user);

    return user;
  }

  // Si se reconoce la persona y tiene un horario activo
  private async processSchedule(user: any) {
    const { schedule } = user;
    const scheduleObj = await this.scheduleModel.findById(schedule);


    if (!scheduleObj) {
      throw new BadRequestException('No se encontró un horario establecido');
    }

    if (!scheduleObj.isActive) {
      throw new BadRequestException('No se pudo realizar el registro, el horario se encuentra inactivo');
    }

    await this.createAttendanceRecord(user, scheduleObj);
  }

  // Funcion que recibe el personal identificado con el horario establecido 
  private async createAttendanceRecord(user: any, schedule: any) {

    let dailyAttendanceDetail: any;

    let savedData: any

    let personalAsigned: boolean

    // informacion de la hora de registro
    const { date, minute, hour, day, dayOfWeekNumber, month, year, dayOfWeek } = this.getCurrentDateTimeInfo();

    // Si existe un registro previo del personal
    const existingAttendance = await this.personalAttendanceModel.findOne({
      personalId: user._id
    });

    // Si existe un dia especial en ese horario
    const specialScheduleForToday = schedule.scheduleSpecial
      .find(specSchedule => specSchedule.day === dayOfWeekNumber && specSchedule.isActive)

    // Si existe el dia de registro en el horario normal
    const normalScheduleForToday = schedule.scheduleNormal
      .find(normalSchedule => normalSchedule.day === dayOfWeekNumber);

    // si existe un día especial en el horario
    if (specialScheduleForToday) {
      personalAsigned = specialScheduleForToday.usersAssigned
        .find(personalId => personalId.toString() === user._id.toString());
    }

    // Si existe un horario especial para el día actual y el usuario está asignado a él
    if (specialScheduleForToday && personalAsigned) {
      dailyAttendanceDetail = await this.createDayAttendanceDetail(specialScheduleForToday, user.id);
    }

    // Si no se ha encontrado un horario especial o el usuario no está asignado a él, verificamos el horario normal
    else if (normalScheduleForToday) {
      dailyAttendanceDetail = await this.createDayAttendanceDetail(normalScheduleForToday, user.id);
    }

    // Si no se ha encontrado ni un horario especial ni uno normal para el día actual
    else {
      throw new BadRequestException(`El día ${dayOfWeek} no pertenece al horario ${schedule.name}`);
    }

    // si ya hay una asistencia registrada para el usuario
    if (existingAttendance) {

      const existingRecordForToday = existingAttendance.attendanceDetail
        .find(detail => detail.date === dailyAttendanceDetail.date);

      // Si ya hay un registro de asistencia para el día actual
      if (existingRecordForToday) {
        existingRecordForToday.entrances = [...existingRecordForToday.entrances, ...dailyAttendanceDetail.entrances];
        existingRecordForToday.exits = [...existingRecordForToday.exits, ...dailyAttendanceDetail.exits];
      } else {
        // Agregar un nuevo registro para el día actual
        existingAttendance.attendanceDetail.push(dailyAttendanceDetail);
      }

      savedData = await existingAttendance.save();
      return savedData;

    } else {
      // Si no existe una planilla para el personal, crear una nueva
      const attendance = new this.personalAttendanceModel({
        personalId: user._id,
        name: user.name,
        lastName: user.lastName,
        ci: user.ci,
        schedule: schedule._id,
        attendanceDetail: [dailyAttendanceDetail]
      });


      savedData = await attendance.save();
      return savedData;
    }
  }

  // Función para crear un detalle de asistencia en el dia que pertenece a un horario. 
  private async createDayAttendanceDetail(schedule: any, personalID: string) {
    let entrances = [];
    let exits = [];

    // Informacion de los datos del horario
    const { into, out, intoTwo, outTwo, toleranceInto, toleranceOut, name } = schedule

    // Informacion de los datos del momento en que se realizar el registro
    const { year, day, month, hour, minute } = this.getCurrentDateTimeInfo();

    // Formato de la fecha: date: '24/10/2023'
    const date = day <= 9 ? `0${day}/${month}/${year}` : `${day}/${month}/${year}`

    //currentHourDecimal: 0.8
    const currentHourDecimal = this.convertHourToDecimal(`${hour}:${minute}`);

    // formatMinute: '48'
    const formatMinute = minute <= 9 ? `0${minute}` : `${minute}`

    // markHourFormat: '00:48'
    const markHourFormat = hour <= 9 ? `0${hour}:${formatMinute}` : `${hour}:${formatMinute}`;

    const morningEntryResult = this.handleControlPoint(into, toleranceInto, currentHourDecimal, markHourFormat, ControlPoints.ENTRADA);
    const hasMorningEntryRecord = await this.hasEntranceRecordedForShift(personalID, date, 'MAÑANA', 'entrance');
    if (morningEntryResult.marked && !hasMorningEntryRecord) {
      const recordWithShift = { ...morningEntryResult.record, shift: 'MAÑANA' };
      entrances.push(recordWithShift);
    } else if (morningEntryResult.marked && hasMorningEntryRecord) {
      throw new BadRequestException('Ya existe un registro de entrada para el turno de la MAÑANA.');
    }

    const morningExitResult = this.handleControlPoint(out, toleranceOut, currentHourDecimal, markHourFormat, ControlPoints.SALIDA);
    const hastMorningExitRecord = await this.hasEntranceRecordedForShift(personalID, date, 'MAÑANA', 'exit');
    if (morningExitResult.marked && !hastMorningExitRecord) {
      const recordWithShift = { ...morningExitResult.record, shift: 'MAÑANA' };
      exits.push(recordWithShift);
    } else if (morningExitResult.marked && hastMorningExitRecord) {
      throw new BadRequestException('Ya existe un registro de salida para el turno de la MAÑANA.');
    }

    const afternoonEntryResult = this.handleControlPoint(intoTwo, toleranceInto, currentHourDecimal, markHourFormat, ControlPoints.ENTRADA);
    const hasAfternoonEntryRecord = await this.hasEntranceRecordedForShift(personalID, date, 'TARDE', 'entrance');
    if (afternoonEntryResult.marked && !hasAfternoonEntryRecord) {
      const recordWithShift = { ...afternoonEntryResult.record, shift: 'TARDE' };
      entrances.push(recordWithShift);
    } else if (afternoonEntryResult.marked && hasAfternoonEntryRecord) {
      throw new BadRequestException('Ya existe un registro de entrada para el turno de la TARDE.');
    }

    const afternoonExitResult = this.handleControlPoint(outTwo, toleranceOut, currentHourDecimal, markHourFormat, ControlPoints.SALIDA);
    const hastAfternoonExitRecord = await this.hasEntranceRecordedForShift(personalID, date, 'TARDE', 'exit')
    if (afternoonExitResult.marked && !hastAfternoonExitRecord) {
      const recordWithShift = { ...afternoonExitResult.record, shift: 'TARDE' };
      exits.push(recordWithShift);
    } else if (afternoonExitResult.marked && hastAfternoonExitRecord) {
      throw new BadRequestException('Ya existe un registro de salida para el turno de la TARDE.');
    }

    // No permitimos el registro fuera del horario establecido de registro...
    if (!morningEntryResult.marked && !morningExitResult.marked && !afternoonEntryResult.marked && !afternoonExitResult.marked) {
      throw new BadRequestException('Registro Fuera de Tiempo');
    }

    // En este punto estamos seguro que el dia que se gistra pertenece a un dia del horario establecido


    if (name) {
      return {
        date,
        specialDay: name,
        entrances,
        exits
      }
    } else {
      return {
        date,
        specialDay: '',
        entrances,
        exits
      }
    }
  }

  private handleControlPoint(
    controlHour: string,
    tolerance: number,
    currentHourDecimal: number,
    markedHour: string,
    controlType: ControlPoints
  ) {
    const controlHourDecimal = this.convertHourToDecimal(controlHour);


    let isWithinControlRange: boolean;
    let infraccion: number;
    let status: AttendanceStatus;
    let shift: string;
    let record: any;

    if (controlType === ControlPoints.ENTRADA) {
      isWithinControlRange = currentHourDecimal >= controlHourDecimal - 0.25 && currentHourDecimal <= (controlHourDecimal + 0.25) + tolerance / 60

      if (isWithinControlRange) {
        if (currentHourDecimal <= controlHourDecimal + tolerance / 60) {
          infraccion = 0;
          status = AttendanceStatus.PUNTUAL;
        } else {
          infraccion = (currentHourDecimal - (controlHourDecimal + tolerance / 60)) * 60;
          status = AttendanceStatus.RETRASO;
        }
      }

    } else if (controlType === ControlPoints.SALIDA) {
      isWithinControlRange = currentHourDecimal >= controlHourDecimal && currentHourDecimal <= controlHourDecimal + 0.25 + tolerance / 60;

      if (isWithinControlRange) {
        if (currentHourDecimal < controlHourDecimal) {
          infraccion = 0;
          status = AttendanceStatus.PUNTUAL;
        } else if (currentHourDecimal <= controlHourDecimal + tolerance / 60) {
          infraccion = 0;
          status = AttendanceStatus.PUNTUAL;
        } else {
          infraccion = (currentHourDecimal - (controlHourDecimal + tolerance / 60)) * 60;
          status = AttendanceStatus.RETRASO;
        }
      }
    }

    if (isWithinControlRange) {
      const infraccionFormat = this.infraccionFormat(infraccion);
      record = this.createRecord(controlHour, tolerance, markedHour, infraccionFormat, controlType, status, shift);
      return { marked: true, record };
    }

    // Trabajar en la parte de licencias e inasistencias...
    return {
      marked: false,
      record: ''
    };
  }

  // record:{
  //   hour: '--:--',
  //   tolerance: 0,
  //   marketHour: '--:--',
  //   infraccion: '--:--',
  //   type: 'AUSENTE',
  //   status: AttendanceStatus.INASISTENCIA,
  //   shift: this.determineShift(controlHourDecimal)
  // } 

  // private handleControlPoint(
  //   controlHour: string,
  //   tolerance: number,
  //   currentHourDecimal: number,
  //   markedHour: string,
  //   controlType: ControlPoints
  // ) {
  //   const controlHourDecimal = this.convertHourToDecimal(controlHour);


  //   let isWithinControlRange: boolean;
  //   let infraccion: number;
  //   let status: AttendanceStatus;
  //   let shift: string;



  //   if (controlType === ControlPoints.ENTRADA) {
  //     isWithinControlRange = currentHourDecimal >= controlHourDecimal - 0.25 && currentHourDecimal <= (controlHourDecimal + 0.25) + tolerance / 60

  //     if (isWithinControlRange) {
  //       if (currentHourDecimal <= controlHourDecimal + tolerance / 60) {
  //         infraccion = 0;
  //         status = AttendanceStatus.PUNTUAL;
  //       } else {
  //         infraccion = (currentHourDecimal - (controlHourDecimal + tolerance / 60)) * 60;
  //         status = AttendanceStatus.RETRASO;
  //       }
  //     } else {
  //       return { 
  //         marked: false, 
  //         record: {
  //           hour: '--:--',
  //           tolerance: 0,
  //           marketHour: '--:--',
  //           infraccion: '--:--',
  //           type: 'AUSENTE', 
  //           status: AttendanceStatus.INASISTENCIA,
  //           shift: this.determineShift(controlHourDecimal)
  //         }
  //       }
  //     }

  //     // Arreglar el bug de retraso por la tarde
  //   } else if (controlType === ControlPoints.SALIDA) {
  //     isWithinControlRange = currentHourDecimal >= controlHourDecimal && currentHourDecimal <= controlHourDecimal + 0.25 + tolerance / 60;

  //     if (isWithinControlRange) {
  //       if (currentHourDecimal < controlHourDecimal) {
  //         infraccion = 0;
  //         status = AttendanceStatus.PUNTUAL;
  //       } else if(currentHourDecimal <= controlHourDecimal + tolerance / 60) {
  //         infraccion = 0;
  //         status = AttendanceStatus.PUNTUAL;
  //       } else {
  //         infraccion = (currentHourDecimal - (controlHourDecimal + tolerance / 60)) * 60;
  //         status = AttendanceStatus.RETRASO;
  //       }
  //     } else{
  //       return { 
  //         marked: false, 
  //         record: {
  //           hour: null,
  //           tolerance: null,
  //           marketHour: null,
  //           infraccion: "Inasistencia",
  //           type: null,
  //           status: AttendanceStatus.INASISTENCIA,
  //           shift: this.determineShift(controlHourDecimal)
  //         }
  //       }
  //     }
  //   }

  //   if (isWithinControlRange) {
  //     const infraccionFormat = this.infraccionFormat(infraccion);
  //     const record = this.createRecord(controlHour, tolerance, markedHour, infraccionFormat, controlType, status, shift);
  //     return { marked: true, record };
  //   }

  //   return { marked: false, record: null };
  // }

  private createRecord(hour: string, tolerance: number, marketHour: string, infraccion: string, type: string, status: string, shift: string) {
    return {
      hour: hour,
      tolerance: tolerance,
      marketHour: marketHour,
      infraccion: infraccion,
      type: type,
      status: status,
      shift: shift
    };
  }

  private infraccionFormat(infraccion: number) {
    // const infraccionFormatString = `${infraccion} min`
    const infraccionFormatString = `${parseInt(infraccion.toString().split('.')[0])} min`;
    return infraccionFormatString;
  }

  private convertHourToDecimal(hourString: any) {
    const [hour, minutes] = hourString.split(':').map(Number);
    return hour + minutes / 60;
  }

  private getCurrentDateTimeInfo(): DateTimeInfo {
    const currentDate = new Date();
    const currentDayOfWeekNumber = currentDate.getDay();
    const currentMinute = currentDate.getMinutes();
    const currentHour = currentDate.getHours();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    let month: any;
    if (currentMonth <= 9) {
      month = `0${currentMonth}`;
    } else {
      month = currentMonth;
    }

    const daysOfWeek = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado'
    ];

    const currentDayOfWeek = daysOfWeek[currentDayOfWeekNumber];

    return {
      date: currentDate,
      minute: currentMinute,
      hour: currentHour,
      day: currentDay,
      dayOfWeekNumber: currentDayOfWeekNumber,
      month,
      year: currentYear,
      dayOfWeek: currentDayOfWeek
    };
  }

  private determineShift(controlHourDecimal: number): string {
    const midday = 12.0;

    if (controlHourDecimal < midday) {
      return 'MAÑANA';
    } else {
      return 'TARDE';
    }
  }

  // Integrar la función hasEntranceRecordedForShift que verifica si ya existe un registro para un turno específico
  private async hasEntranceRecordedForShift(personalId: string, date: string, shift: string, recordType: string) {
    try {
      const record = await this.personalAttendanceModel.findOne({
        personalId: personalId,
        'attendanceDetail.date': date
      });

      if (record && record.attendanceDetail) {
        const detailForDate = record.attendanceDetail.find(detail => detail.date === date);
        if (detailForDate) {
          if (recordType === 'entrance') {
            return detailForDate.entrances.some(entrance => entrance.shift === shift);
          } else if (recordType === 'exit') {
            return detailForDate.exits.some(exit => exit.shift === shift);
          }
        }
      }
      return false;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }


  async findOneReport(personalId: string): Promise<Buffer> {
    const attendancePersonal = await this.personalAttendanceModel.findOne({ personalId }).exec();
    if (attendancePersonal) {
      const { name, lastName, ci, schedule, attendanceDetail } = attendancePersonal
      const data = { name, lastName, ci, schedule, attendanceDetail };
      return await this.generateReportAttendance.generateReportAttendance(data);
    } else {
      throw new BadRequestException('No se pudo generar el pdf')
    }
  }
}
