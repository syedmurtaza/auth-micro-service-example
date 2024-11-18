import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';


@Module({
    imports: [
        ClientsModule.register([
            { name: 'AUTH_SERVICE', transport: Transport.TCP, options: { host: '127.0.0.1', port: 8878 } },
            { name: 'USERS_SERVICE', transport: Transport.TCP, options: { host: '127.0.0.1', port: 8879 } },
        ]),

    ],
    controllers: [GatewayController],
    providers: [GatewayService],
})
export class GatewayModule { }
