import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
//import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GatewayService } from './gateway.service';
import { catchError } from 'rxjs';

@Controller('api/v1')
export class GatewayController {
    private readonly logger = new Logger(GatewayController.name, { timestamp: true });

    constructor(
        private gatewayService: GatewayService,

    ) { }


    @Post('auth/login')

    async login(@Body() data: { email: string; password: string }) {

        try {
            return this.gatewayService.login(data);
        } catch (error) {
            this.logger.error(`Failed to find Authenticate user: ${error.message}`);
            return `Failed to find Authenticate user: ${error.message}`;
        }

    }

}

//https://github.com/RicardoJardim/NestMicroservice/