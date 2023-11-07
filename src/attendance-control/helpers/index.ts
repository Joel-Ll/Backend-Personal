
export const  convertToISOFormat = (inputDate) => {
  const [day, month, year] = inputDate.split('/');
  return new Date(Number(year), Number(month) - 1, Number(day));
}

// Función para obtener todos los días en número de las fechas de búsqueda
export const getDaysArrayByWeek = (initialDateObj, endDateObj) => {
  let arrDays = [];
  
  for(let dt = new Date(initialDateObj); dt <= endDateObj; dt.setDate(dt.getDate() + 1)) {
    arrDays.push({
      date: new Date(dt), // Almacena una copia del objeto Date para cada día
      dayOfWeek: dt.getDay() // getDay devuelve el número de día de la semana (0 = domingo, 1 = lunes, etc.)
    });
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