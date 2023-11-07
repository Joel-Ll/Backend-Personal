import { BadGatewayException, Injectable } from '@nestjs/common';
import { PersonalService } from 'src/personal/personal.service';
import { generatePersonnelData } from './data/seed.personal';

@Injectable()
export class SeedService {

  constructor(
    private readonly personalService: PersonalService
  ) {}

  async runSeed() {
    try {
      await this.insertNewPersonal();
      console.log('Insertion completed successfully.');
    } catch (error) {
      throw new BadGatewayException('No se pudo realizar la insersion de datos')
    }
  }

  private async insertNewPersonal() {
    const seedPersonal = generatePersonnelData();
    const batchSize = 500; // La cantidad de inserciones por lote
    for (let i = 0; i < seedPersonal.length; i += batchSize) {
      const batch = seedPersonal.slice(i, i + batchSize);
      const insertPromises = batch.map(personal => this.personalService.create(personal));
      await Promise.all(insertPromises).catch(error => {
        console.error('Error inserting batch:', error);
        // Manejo de error opcional aquí
      });
    }
  }

  // private async insertNewPersonal() {
  //   const seedPersonal = generatePersonnelData();

  //   const insertPromises = [];
    
  //   seedPersonal.forEach( personal => {
  //     insertPromises.push( this.personalService.create( personal ))
  //   });
  //   await Promise.all( insertPromises )
  // }
}
