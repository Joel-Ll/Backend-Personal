import { ApiProperty } from "@nestjs/swagger";

export class loginAuthDTO {
	@ApiProperty()
	email: string;

	@ApiProperty()
	password: string
}

export class LoginCentralDTO {
	@ApiProperty()
	app: string;

	@ApiProperty()
	token: string
}

