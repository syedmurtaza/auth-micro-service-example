import { Controller, Get, Post, Body, Param, UseGuards, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/user.dto';
import { MessagePattern, RpcException } from '@nestjs/microservices';

//TODO: Get the JWT Guard from the auth service
//import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('api/v1/users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name, { timestamp: true });
    constructor(private readonly usersService: UsersService) { }

    @Post('register')
    @UsePipes(new ValidationPipe())
    async create(@Body() createUserDto: CreateUserDto) {
        try {
            return await this.usersService.create(createUserDto);
        } catch (error) {
            this.logger.error(`Failed to create user: ${error.message}`);
            throw error;
        }
    }

    //@UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string) {

        try {
            const user = await this.usersService.findOne(id.toString());
            if (!user) {
                throw new RpcException('User not found');
            }
            return user;
        } catch (error) {
            this.logger.error(`Failed to find user by ID: ${error.message}`);
            throw error;
        }
    }

    //TODO: https://medium.com/@manfulmwez/beyond-the-basics-unleashing-advanced-routing-power-in-nestjs-0adbadd83736#:~:text=To%20define%20a%20dynamic%20route,route%20is%20a%20dynamic%20parameter.


    @MessagePattern({ cmd: 'getUserByEmail' })
    async findByEmail(email: string) {

        try {
            this.logger.debug(`Searching for user with email: ${email}`);
            const user = await this.usersService.findByEmail(email.toString());

            if (!user) {
                throw new RpcException('User not found');
            }

            return user;
        } catch (error) {
            this.logger.error(`Failed to find user by email: ${error.message}`);
            throw new RpcException(error.message);
        }
    }
}