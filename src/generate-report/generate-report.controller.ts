import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { GenerateReportService } from './generate-report.service';
import { CreateGenerateReportDto } from './dto/create-generate-report.dto';
import { UpdateGenerateReportDto } from './dto/update-generate-report.dto';
import { AttendanceControlService } from 'src/attendance-control/attendance-control.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
// import data from 'pdfkit/js/data';

@Controller('generate-report')
export class GenerateReportController {
  constructor(
    private readonly attendanceControlService: AttendanceControlService,
    private readonly generateReportService: GenerateReportService,
  ) {}
  
  // : Promise<Buffer>
  @ApiTags('Reportes')
  @ApiOperation({
    summary: 'Generacion de Reporte de Control de Asistencia en PDF',
    description: 'Genera el reporte en pdf del control de asistena de un personal, con el atributo personalId del control de asistencia'
  })
  @Post('pdf-attendance/download/:personalId')
  async downloadPdf(@Param('personalId') personalId: string, @Res() res): Promise<void> {
    const buffer = await this.attendanceControlService.findOneReport(personalId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=example.pdf',
      'Content-Length': buffer.length,
    })
    res.end(buffer);
  }
}
