
export interface DateTimeInfo { 
	date: Date, 
	minute: number, 
	hour: number, 
	day: number,
	dayOfWeekNumber: number,
	month: number, 
	year: number, 
	dayOfWeek: string 
}

export enum ControlPoints {
	ENTRADA = "ENTRADA",
	SALIDA = "SALIDA",
}

export enum AttendanceStatus {		
  PUNTUAL = 'PUNTUAL',
  RETRASO = 'RETRASO',
  INASISTENCIA = 'INASISTENCIA',
  AUSENCIA = 'AUSENCIA'
}















// private createDayAttendanceDetail(specialScheduleForToday: any) {
//   let entrances = [];
//   let exits = [];

//   const { into, out, intoTwo, outTwo, toleranceInto, toleranceOut, name } = specialScheduleForToday
//   const { year, day, month, hour, minute, dayOfWeek } = this.getCurrentDateTimeInfo();
//   const date = `${day}/${month}/${year}`


//   // Modularizar codigo

//   const currentHourDecimal = this.convertHourToDecimal(`${hour}:${minute}`);
//   const hourIntoDecimal = this.convertHourToDecimal(into);
//   const hourOutDecimal = this.convertHourToDecimal(out);

//   const intoMorning = currentHourDecimal >= hourIntoDecimal - 1 && currentHourDecimal <= (hourIntoDecimal + 1) + toleranceInto / 60
//   const outMorning = currentHourDecimal >= hourOutDecimal && currentHourDecimal <= (hourOutDecimal + 1) + toleranceOut / 60

//   let infraccion: number;

//   let markHourIntoFormat: any;
//   let markedAttendance = false

//   const markHourInto = hour;

//   if (markHourInto <= 9) {
//     markHourIntoFormat = `0${markHourInto}:${minute}`;
//   } else {
//     markHourIntoFormat = `${markHourInto}:${minute}`;
//   }

//   if (intoMorning) {
//     if (currentHourDecimal <= hourIntoDecimal + toleranceInto / 60) {
//       infraccion = 0;
//       const infraccionFormat = this.infraccionFormat(infraccion)
//       // Llegó temprano o justo a tiempo (dentro de la tolerancia)
//       entrances.push(this.createRecord(into, toleranceInto, markHourIntoFormat, infraccionFormat, 'Entrada', 'Puntual'));
//       markedAttendance = true;
//     } else {
//       // Llegó tarde (después de la tolerancia)
//       infraccion = (currentHourDecimal - (hourIntoDecimal + toleranceInto / 60)) * 60;
//       const infraccionFormat = this.infraccionFormat(infraccion)
//       entrances.push(this.createRecord(into, toleranceInto, markHourIntoFormat, infraccionFormat, 'Entrada', 'Retraso'));
//       markedAttendance = true;
//     }
//   }

//   if (outMorning) {

//   }

//   if (!markedAttendance) {
//     // No marcó su asistencia
//     entrances.push(this.createRecord(into, toleranceInto, "N/A", "N/A", '----', 'Inasistencia'));
//   }

//   if (!intoMorning) {
//     throw new BadRequestException('No puede registrar su asistencia fuera del rango establecido')
//   }

//   return {
//     date,
//     specialDay: name,
//     // entrances: [],  
//     // exits: []
//   };
// }



// // Función para crear un detalle de asistencia para un día normal
// private createNormalDayAttendanceDetail(schedule: any) {
//   const dateTimeInfo = this.getCurrentDateTimeInfo();
//   const { year, day, month } = dateTimeInfo;
//   const date = `${day}/${month}/${year}`

//   return {
//     date,
//     specialDay: '',
//     // entrances: [{ time: `${hour}:${minute}` }],
//     // exits: []
//   };
// }







// private async createAttendanceRecord(user: any, schedule: any) {
//   let dailyAttendanceDetail: any;
//   const { day, dayOfWeek } = this.getCurrentDateTimeInfo();

//   const existingAttendance = await this.personalAttendanceModel.findOne({
//     personalId: user._id
//   });

//   if (existingAttendance) {
//     const specialScheduleForToday = schedule.scheduleSpecial
//       .find(specSchedule => specSchedule.day === day && specSchedule.isActive)

//     if (specialScheduleForToday) {
//       // await this.handleSpecialSchedule(user, specialScheduleForToday, existingAttendance);

//     } else {
//       // await this.handleNormalSchedule(user, schedule, existingAttendance);
//     }

//   } else {
//     const attendance = new this.personalAttendanceModel({
//       personalId: user._id,
//       name: user.name,
//       lastName: user.lastName,
//       ci: user.ci,
//       schedule: schedule.name,
//       attendanceDetail: []
//     });

//     const specialScheduleForToday = schedule.scheduleSpecial
//       .find(specSchedule => specSchedule.day === day && specSchedule.isActive)

//     const normalScheduleForToday = schedule.scheduleNormal
//       .find( normalSchedule => normalSchedule.day === day );

//     if (specialScheduleForToday) {
//       const personalAsigned = specialScheduleForToday.usersAssigned
//         .find(personalId => personalId === user._id)

//       if (personalAsigned) {
//         dailyAttendanceDetail = this.createDayAttendanceDetail(specialScheduleForToday);
//       }

//     } else if ( normalScheduleForToday ){
//       dailyAttendanceDetail = this.createDayAttendanceDetail(schedule);
//     }

//     if( !specialScheduleForToday && !normalScheduleForToday ) {
//       throw new BadRequestException(`Los dias ${dayOfWeek} no pertenecen al horario ${schedule.name}`)
//     }

//     attendance.attendanceDetail.push(dailyAttendanceDetail)
//     await attendance.save();
//   }
// }