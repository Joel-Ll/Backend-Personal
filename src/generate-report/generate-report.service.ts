import { BadRequestException, ConsoleLogger, Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateGenerateReportDto } from './dto/create-generate-report.dto';
import { UpdateGenerateReportDto } from './dto/update-generate-report.dto';
import { ScheduleService } from 'src/schedule/schedule.service';
const fs = require("fs");
import { join, resolve } from 'path';
import { DateTimeInfo } from 'src/attendance-control/interfaces/DateTimeInfo.interface';
const PDFDocument = require('pdfkit-table');

@Injectable()
export class GenerateReportService {

  constructor(
    private readonly scheduleService: ScheduleService,
  ) { }

  async generateReportAttendance(data: any): Promise<Buffer> {
    const { name, lastName, ci, schedule, attendanceDetail } = data;
    const infoSchedule = await this.scheduleService.findOne(schedule);
    const nameSchedule = infoSchedule.name;
    console.log(nameSchedule)
    console.log(attendanceDetail)
    


    // Creacion del Template de Reporte de asistencia
    const pdfBuffer: Buffer = await new Promise(resolve => {
      const doc = new PDFDocument({
        size: "LETTER",
        bufferPages: true,
        autoFirstPage: false,
      })
      // LETTER (612.00 X 792.00)

      // const table = {
      //   title: `${nameSchedule}`,
      //   headers: [
      //     { label: 'HORA', property: 'hora', width: 85 },
      //     { label: 'TOLERANCIA', property: 'tolerancia', width: 85 },
      //     { label: 'MARCADO', property: 'marcado', width: 85 },
      //     { label: 'INFRACCION', property: 'infraccion', width: 85 },
      //     { label: 'TIPO', property: 'tipo', width: 85 },
      //     { label: 'TURNO', property: 'turno', width: 85 },
      //   ]
      // }

      let pageNumber = 0;
      doc.on('pageAdded', () => {
        pageNumber++;

        // ------ Genera el estilo en la primera pagina
        if (pageNumber === 1) {
          // configuraciones para el encabezado
          const imageWidth = 45;
          const imageHeight = 45;
          const imageX = doc.page.width - 100;
          const imageY = 20;
          const textY = imageY + imageHeight / 2;
          const lineY = imageY + imageHeight + 10;

          // Agregar encabezado a la primera pagina
          doc.image(join(process.cwd(), "uploads/uatf-logo.jpg"), imageX, imageY, { fit: [imageWidth, imageHeight], align: 'center' });
          doc.fontSize(10);
          doc.text("SISTEMA DE CONTROL PERSONAL", { align: 'center', valign: 'center', baseline: 'middle' }, textY);
          doc.moveDown(0.5);
          doc.font("Helvetica-Bold").fontSize(15);
          doc.text("REPORTE DE ASISTENCIAS", { align: 'center', valign: 'center', baseline: 'middle' });
          doc.moveTo(50, lineY)
            .lineTo(doc.page.width - 50, lineY)
            .stroke();

          doc.font("Helvetica-Bold")
            .fontSize(13)
            .text('Nombre Completo', 50, lineY + 20, { continued: true });
          doc.font("Helvetica")
            .text(`: ${name} ${lastName}`, lineY - 10);
          doc.moveDown(0.5);

          doc.font("Helvetica-Bold")
            .text('Nro. CI.', 50, lineY + 40, { continued: true });
          doc.font("Helvetica")
            .text(`: ${ci}`, lineY - 10);
        }
        // // Agregar el header de la tabla 
        // doc.text('', 50, 160);
        // doc.table(table) 

        // Agregar footer a todas las paginas pagina
        let bottom = doc.page.margins.bottom;
        let formattedDate = this.formatDateReportUsingInfo();

        doc.page.margins.bottom = 0;
        let yPos = doc.page.height - 50;
        doc.font('Helvetica-Bold')
          .fontSize(12)
          .text('Fecha del reporte:', 40, yPos, { continued: true });

        doc.font("Helvetica")
          .text(` ${formattedDate}`);

        doc.text(`${pageNumber}`, doc.page.width - 40, yPos, {
          align: 'right'
        });
        doc.page.margins.bottom = bottom;
      })

      doc.addPage();
      doc.text('', 50, 160);
      const renderTable = (data: any) => {
        doc.text(`FECHA: ${data.date}`, 50, 160, { width: 500, align: 'center' });
        doc.text('', 50, doc.y + 10);

      //       {
      //         "hora": "09:45",
      //         "tolerancia": "10 min"
      //         "marketHour": "09:48",
      //         "infraccion": "0 min",
      //         "type": "ENTRADA",
      //         "status": "PUNTUAL",
      //         "shift": "MAÑANA",
      //         "_id": "652e90c0dfb32044117d5dd3"
      //       }

        const entranceRows = data.entrances.map(entry => [entry.marketHour, entry.infraccion, entry.type, entry.status, entry.shift]);
        const exitRows = data.exits.map(exit => [exit.marketHour,exit.infraccion, exit.type, exit.status, exit.shift]);
        const allRows = [...entranceRows, ...exitRows];

        const table = {
          headers: [
            { label: 'HORA', property: 'hora', width: 85 },
            { label: 'TOLERANCIA', property: 'tolerancia', width: 85 },
            { label: 'MARCADO', property: 'marcado', width: 85 },
            { label: 'INFRACCION', property: 'infraccion', width: 85 },
            { label: 'TIPO', property: 'tipo', width: 85 },
            { label: 'TURNO', property: 'turno', width: 85 },
          ],
        }
        
      }
      
      attendanceDetail.forEach( detail => {
        renderTable( detail );
      });


  
      const buffer = []
      doc.on('data', buffer.push.bind(buffer))
      doc.on('end', () => {
        const data = Buffer.concat(buffer)
        resolve(data)
      })
      doc.end()
    })
    return pdfBuffer;
  }

  private formatDateReportUsingInfo(): string {
    const dateTimeInfo = this.getCurrentDateTimeInfo();

    const monthsNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const formattedDate = `${dateTimeInfo.dayOfWeek}, ${dateTimeInfo.day.toString().padStart(2, '0')} de ${monthsNames[dateTimeInfo.month - 1]} de ${dateTimeInfo.year} ${dateTimeInfo.hour.toString().padStart(2, '0')}:${dateTimeInfo.minute.toString().padStart(2, '0')}`;
    return formattedDate;
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
}


      // doc.text('', 50, 160);

      // const table = {
      //   title: `${nameSchedule}`,
      //   headers: [
      //     { label: 'HORA', property: 'hora', width: 85 },
      //     { label: 'TOLERANCIA', property: 'tolerancia', width: 85 },
      //     { label: 'MARCADO', property: 'marcado', width: 85 },
      //     { label: 'INFRACCION', property: 'infraccion', width: 85 },
      //     { label: 'TIPO', property: 'tipo', width: 85 },
      //     { label: 'TURNO', property: 'turno', width: 85 },
      //   ],
      //   rows: [['12:00','12:00','12:43','2 min', 'Entrada', 'Tarde'],['12:00','12:00','12:43','2 min', 'Entrada', 'Tarde']]
      // }

      // doc.table(table)      
      // , {columnSize: [100, 10, 100, 100, 100, 100]}




      // const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right; 
      // const columnWidth = pageWidth / 6;
      // let startX = doc.page.margins.left - 20;  
      // let startY = 160;  

      // const headers = ["Hora", "Tolerancia", "Marcado", "Infracción", "Tipo", "Turno"];

      // headers.forEach((header) => {
      //     doc.rect(startX, startY, columnWidth, 20).stroke();  // Dibuja el borde de la celda
      //     doc.text(header, startX + (columnWidth / 2), startY + 5, { align: 'center', baseline: 'middle' });  // Texto alineado en el centro de la celda
      //     startX += columnWidth;
      // });

      // // let startY = 160;
      // // let startX = doc.page.margins.left - 20;
      // const subHeaderY = startY + 80;
      // let labelWidth = 150;
      // let gap = 5;
      // const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      // const totalMargin = 20; // 20 en cada lado
      // const usableWidth = pageWidth - totalMargin;
      // const headerHeight = 35;

      // const totalWidth = pageWidth;
      // const columnWidths = {
      //   horarioEstablecido: usableWidth * 0.35,  // 40% del ancho usable
      //   horarioRegistrado: usableWidth * 0.4,  // 40% del ancho usable
      //   descripcion: usableWidth * 0.4   // 20% del ancho usable
      // };

      // // Dibujando encabezado de la tabla
      // doc.font('Helvetica-Bold').fontSize(10);

      // doc.rect(startX, startY, columnWidths.horarioEstablecido, headerHeight).stroke();
      // doc.text(`HORARIO\nESTABLECIDO`, startX + 5, startY + headerHeight / 4, { width: columnWidths.horarioEstablecido, align: 'center' });

      // // Columna 'HORARIO REGISTRADO'
      // doc.rect(startX + columnWidths.horarioEstablecido, startY, columnWidths.horarioRegistrado, headerHeight).stroke();
      // doc.text('HORARIO REGISTRADO', startX + columnWidths.horarioEstablecido + 5, startY + 5 + headerHeight / 4, { width: columnWidths.horarioRegistrado, align: 'center' });

      // // Columna 'DESCRIPCIÓN'
      // doc.rect(startX + columnWidths.horarioEstablecido + columnWidths.horarioRegistrado, startY, columnWidths.descripcion, headerHeight).stroke();
      // doc.text('DESCRIPCIÓN', startX + columnWidths.horarioEstablecido + columnWidths.horarioRegistrado + 5, startY + 5 + headerHeight / 4, { width: columnWidths.descripcion, align: 'center' });


      // ----------------



            // Generacion de la tabla de Horarios
      // Info Schedule Data

      // "attendanceDetail": [
      //   {
      //     "date": "17/10/2023",
      //     "specialDay": "",
      //     "entrances": [
      //       {
      //         "marketHour": "09:48",
      //         "infraccion": "0 min",
      //         "type": "ENTRADA",
      //         "status": "PUNTUAL",
      //         "shift": "MAÑANA",
      //         "_id": "652e90c0dfb32044117d5dd3"
      //       }
      //     ],
      //     "exits": [
      //        {
      //          "marketHour": "09:48",
      //          "infraccion": "0 min",
      //          "type": "ENTRADA",
      //          "status": "PUNTUAL",
      //          "shift": "MAÑANA",
      //          "_id": "652e90c0dfb32044117d5dd3"
      //        }
      //      ],
      //     }
      //   ],
      
      // const row_attendance = [];