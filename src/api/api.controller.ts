import { Body, Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiService } from './api.service';
import { LoginCentralDTO } from './api.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { HttpService } from '@nestjs/axios';

@Controller('')
export class ApiController {
	constructor(
		private readonly apiService: ApiService,
		private readonly httpService: HttpService
	) {}

	@ApiTags('login-auth')
	@Post('login-central')
	async loginCentral(@Req() req: Request, @Res() res: Response, @Body() loginCentralDTO: LoginCentralDTO) {
		try {
			console.log(loginCentralDTO)
			const response = await this.apiService.loginAuthCentral(loginCentralDTO)
			res.send(response);
		} catch (error) {
			console.log(error)
			throw error
		}
	}
}

