//npm install class-validator class-transformer

import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Length(8, 20)
    password: string;

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;
}