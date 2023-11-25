import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { LoginCentralDTO } from './api.dto';

@Injectable()
export class ApiService {
	private apiSeguridad = process.env.API_SEGURIDAD;

	constructor(
		private readonly httpService: HttpService,
	) {}

	async test() {
		return 'Hello from services'
	}

	async loginAuthCentral(loginCentralDTO: LoginCentralDTO) {
		try {
			const response = await this.httpService.post(`${this.apiSeguridad}/auth/verify-app-token`, loginCentralDTO).toPromise()
			return response.data	
		} catch (error) { 
			throw error.response?.data
		}
	}
}