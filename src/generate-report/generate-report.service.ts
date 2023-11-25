

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

  // Arrglar la devolucion del mes 

  async generateReportAttendance(data: any): Promise<Buffer> {
    const planillaSueldo = data[0];
    const planillaAsistencia = data[1];
    console.log(planillaAsistencia);

    // Informacion de la planilla de sueldo
    const fullName = planillaSueldo.nombre_apellido;
    const mes = planillaSueldo.detalle.mes;
    const gestion = planillaSueldo.detalle.gestion;
    const fechaIngreso = planillaSueldo.fechaIngreso;
    const cargo = planillaSueldo.cargo;
    const haberBasico = planillaSueldo.haber_basico;
    const categoria = planillaSueldo.categoria;
    const totalCategoria = planillaSueldo.total_categoria;
    const totalGanado = planillaSueldo.total_ganado;
    // Aportes
    const aporteAfps = planillaSueldo.descuentos.aporte_afps;
    const aporteNacSol = planillaSueldo.descuentos.aporte_nacional_solidario;
    const aporteRcIva = planillaSueldo.descuentos.rc_iva;
    const totalAportaciones = planillaSueldo.descuentos.total_aportaciones;
    // Faltas y Retrasos
    const minAtrasos = planillaSueldo.inf_faltas_atrasos.min_atrasos;
    const diasFaltas = planillaSueldo.inf_faltas_atrasos.dias_de_falta;

    // Descuentos por faltas y retrasos;
    const sancionAtrasos = planillaSueldo.otros_descuentos.sancion_atrasos;
    const sancionFaltas = planillaSueldo.otros_descuentos.sancion_faltas;
    const totalSanciones = planillaSueldo.otros_descuentos.total_sanciones;

    // Calculos totales;
    const totalDescuentos = planillaSueldo.total_descuentos;
    const liquidoPagable = planillaSueldo.liquido_pagable;

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
          const imageWidth = 70;
          const imageHeight = 70;
          const imageX = doc.page.width - 100;
          const imageY = 20;
          const textY = imageY + imageHeight / 2;
          const lineY = imageY + imageHeight + 10;
          const linex = 0;

          // Agregar encabezado a la primera pagina
          doc.image(join(process.cwd(), "uploads/logo_black.png"), imageX - 5, imageY + 10, { fit: [imageWidth, imageHeight], align: 'center' });
          doc.fontSize(10);
          doc.text("SISTEMA DE CONTROL PERSONAL", { align: 'center', valign: 'center', baseline: 'middle' }, textY);
          doc.moveDown(0.5);
          doc.font("Helvetica-Bold").fontSize(15);
          doc.text("PLANILLA DE SUELDOS", { align: 'center', valign: 'center', baseline: 'middle' });
          doc.moveTo(50, lineY)
            .lineTo(doc.page.width - 50, lineY)
            .stroke();

          doc.font("Helvetica-Bold")
            .fontSize(10)
            .text('Nombre Completo', linex + 45, lineY + 20, { continued: true });
          doc.font("Helvetica")
            .text(`: ${fullName}`, linex + 60);

          doc.font("Helvetica-Bold")
            .text('Fecha de Ingreso', linex + 45, lineY + 40, { continued: true });
          doc.font("Helvetica")
            .text(`: ${fechaIngreso}`, linex + 64.8);

          doc.font("Helvetica-Bold")
            .text('Fecha de Reporte', linex + 45, lineY + 60, { continued: true });
          doc.font("Helvetica")
            .text(`: ${mes} - ${gestion}`, linex + 62.1);
        }

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
      doc.text('',45, 230);
      
      const renderTableSalary = async () => {
        const table = {
          // title: "Detalle de Remuneración",
          subtitle: "Detalle de Remuneración",
          headers: ["CARGO", "HABER BASICO", "CATEGORIA", "TOTAL CATEGORIA", "TOTAL GANADO"],
          rows: [
            [`${cargo}`, `${haberBasico} bs`, `${categoria}`, `${totalCategoria} bs`, `${totalGanado} bs`]
          ],
        }

        await doc.table(table, { 
          width: 500,
        });
        // or columnsSize
        await doc.table(table, { 
          columnsSize: [ 100, 100, 100, 100, 100 ],
        });
        
      }

      const renderTableAportaciones = async () => {
        const table = {
          // title: "Detalle de Remuneración",
          subtitle: "Aportaciones Tributarias",
          headers: ["AFPs", "A. NAC. SOL", "RC-IVA", "TOTAL APORTACIONES"],
          rows: [
            [`${aporteAfps} bs`, `${aporteNacSol} bs`, `${aporteRcIva} bs`, `${totalAportaciones} bs`]
          ],
        }

        await doc.table(table, { 
          width: 500,
        });
        // or columnsSize
        await doc.table(table, { 
          columnsSize: [ 125, 125, 125, 125],
        });
      }

      const renderTableSanciones = async () => {
        const table = {
          // title: "Detalle de Remuneración",
          subtitle: "Descuentos por sanciones",
          headers: ["FALTAS", "RETRASOS", "DESC. FALTAS", "DESC. TRASOS", "TOTAL SANCIONES"],
          rows: [
            [`${diasFaltas} días`, `${minAtrasos} min`, `${sancionFaltas} bs`, `${sancionAtrasos} bs`, `${totalSanciones} bs`]
          ],
        }

        await doc.table(table, { 
          width: 500,
        });
        // or columnsSize
        await doc.table(table, { 
          columnsSize: [ 100, 100, 100, 100, 100],
        });
      }

      const renderTableInfo = async () => {
        const table = {
          // title: "Detalle de Remuneración",
          subtitle: "Detalle de Descuentos y Sueldo",
          headers: ["TOTAL APORTACIONES", "TOTAL SANCIONES", "TOTAL DESCUENTOS", "LIQUIDO PAGABLE"],
          rows: [
            [`${totalAportaciones} bs`, `${totalSanciones} bs`, `${totalDescuentos} bs`, `${liquidoPagable} bs`]
          ],
        }

        await doc.table(table, { 
          width: 500,
        });
        // or columnsSize
        await doc.table(table, { 
          columnsSize: [ 125, 125, 125, 125],
        });
      }

      


      renderTableSalary();
      renderTableAportaciones();
      renderTableSanciones();
      renderTableInfo();






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

