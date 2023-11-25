
export const  convertToISOFormat = (inputDate) => {
  const [day, month, year] = inputDate.split('/');
  return new Date(Number(year), Number(month) - 1, Number(day));
}

// Función para obtener todos los días en número de las fechas de búsqueda
export const getDaysArrayByWeek = (initialDateObj, endDateObj, normalWorkDaysSet, specialWorkDaysSet, isSpecialDayActive) => {
  let arrDays = [];
  
  for (let dt = new Date(initialDateObj); dt <= endDateObj; dt.setDate(dt.getDate() + 1)) {
    const dayOfWeek = dt.getDay();
    console.log({dayOfWeek})
    let isWorkDay = false;
    let isSpecial = false;

    // Primero verifica si el día está en el horario especial y si está activo
    if (specialWorkDaysSet.has(dayOfWeek) && isSpecialDayActive(dt)) {
      isWorkDay = true;
      isSpecial = true;
    }
    // Si no, verifica si está en el horario normal
    else if (normalWorkDaysSet.has(dayOfWeek)) {
      isWorkDay = true;
    }

    if (isWorkDay) {
      arrDays.push({
        date: new Date(dt),
        dayOfWeek: dayOfWeek,
        isSpecial: isSpecial
      });
    }
  }
  return arrDays;
};

// Función para verificar si un día está en el horario proporcionado
export const isDayInSchedule = (day, schedule) => {
  return schedule.some(scheduleDay => scheduleDay.day === day);
};

// Función para verificar si un usuario está asignado al horario especial
export const userAssignedToSpecialSchedule = (user: any, scheduleSpecial) => {
  return scheduleSpecial.some(schedule => schedule.usersAssigned.includes(user));
}

// función busca en el detalle de asistencia para ver si hay registro en una fecha específica
export const isAttendanceRegistered = (attendanceDetails, date) => {
  return attendanceDetails.some(detail => new Date(detail.date).toDateString() === date.toDateString());
};

// export const formatDate = (date: Date) => {
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = date.getFullYear();

//   return `${day}/${month}/${year}`;
// }

export const formatDate = (date: Date) => {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // getUTCMonth() devuelve un número entre 0 y 11, así que sumamos 1.
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
}

export const  isSpecialDayActive = (specialSchedules, date, userId) => {
  const dayOfWeek = date.getDay();
  const specialScheduleForDay = specialSchedules.find(schedule => 
    schedule.day === dayOfWeek &&
    schedule.isActive &&
    schedule.usersAssigned.includes(userId)
  );

  return specialScheduleForDay != null;
}

export const isOnLicense = (licenses, date) => {
  return licenses.some(license => 
    date >= new Date(license.startDate) && date <= new Date(license.endDate)
  );
}

export const formatMonth = (date: Date) => {
  const monthNumber = date.getMonth() + 1;
  const year = date.getFullYear();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return [
    monthNames[monthNumber],
    year
  ]
}

export const formatCategory = ( category: any) => {
  const categoryPorcentaje = [
    '0%', '5%', '10%', '15%'
  ];

  return categoryPorcentaje[category]
}

export const calcTotalCategory = (salario: string, nivel: any) => {
  const porcentaje = [0, 5, 10, 15]
  const calcPorcentaje = porcentaje[nivel] / 100
  const salary = Number(salario);
  const totalCategory = salary * calcPorcentaje
  return totalCategory
}

export const calcAporteNacSol = ( salario: number ) => {
  let aporte: number;

  if( salario > 13000 ) {
    const dif = salario - 13000
    aporte = dif * 0.01;
  } else {
    aporte = 0
  }

  return aporte;
}

export const calcRcIva = (totalGanado: number, afp: number) => {
  const total = totalGanado - afp;
  const aporta = total >= 9448;
  let rcIva: number;

  if( aporta ) {
    rcIva = (total - 9448)*0.13;
  } else {
    rcIva = 0;
  }
  return rcIva;
}

export const extractMinutes = (infraccionStr: string ) => {
  const infraccion = infraccionStr.split(' ');
  return +infraccion[0]
}

export const calcSancionFalta = ( diaPagable: number, faltas: number ) => {
  return faltas * diaPagable;
}

export const calTotalAportaciones = (afps: any, nacSol: any, rcIva: any) => {
  const total = Number(afps) + nacSol + Number(rcIva)
  return total.toFixed(2);
}
 

export const calcSancionAtrasos = (diaPagable: number, totalInfraccionesMinutos: number) => {
  let descuentoMes = 0;
  // De 31 a 60 minutos al mes -> 1/2 día de descuento de haber
  if( totalInfraccionesMinutos >= 31 && totalInfraccionesMinutos <= 60 ) {
    descuentoMes = diaPagable / 2
    return descuentoMes;
  }
  
  // De 61 a 90 minutos al mes -> 1 día de descuento de haber
  if(totalInfraccionesMinutos >= 61 && totalInfraccionesMinutos <= 90 ) {
    descuentoMes = diaPagable
    return descuentoMes;
  }

  // De 91 a 120 minutos al mes -> 2 días de descuento de haber
  if( totalInfraccionesMinutos >= 91 && totalInfraccionesMinutos <= 120 ) {
    descuentoMes = diaPagable * 2
    return descuentoMes;
  }

  // De 121 a 200 minutos al mes -> 3 días de descuento de haber
  if( totalInfraccionesMinutos >= 121 && totalInfraccionesMinutos <= 200 ) {
    descuentoMes = diaPagable * 3;
    return descuentoMes;
  }

  // De 201 a 300 minutos al mes -> 4 días de descuento de haber
  if( totalInfraccionesMinutos >= 201 && totalInfraccionesMinutos <= 300 ) {
    descuentoMes = diaPagable * 4;
    return descuentoMes;
  }

  // De 301 minutos o más al mes -> 10 días de descuento de haber
  if( totalInfraccionesMinutos >= 301  ) {
    descuentoMes = diaPagable * 10;
    return descuentoMes;
  }
  return descuentoMes
}