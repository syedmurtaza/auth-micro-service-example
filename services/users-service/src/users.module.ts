import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import databaseConfig from './config/database.config';


@Module({
    imports: [HttpModule,

        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig],
            envFilePath: '.env', // default path
            cache: true,
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                ...configService.get('database'),
            }),
            inject: [ConfigService],
        }),
        
        TypeOrmModule.forFeature([User])],

    providers: [
        UsersService,
        // {
        //     provide: 'USERS_SERVICE',
        //     useFactory: () => {
        //         return ClientProxyFactory.create({
        //             transport: Transport.TCP,
        //             options: {
        //                 host: '127.0.0.1',
        //                 port: 8879,
        //             },
        //         });
        //     }
        // },
    ],
    controllers: [UsersController],
    //exports: ['USERS_SERVICE'],
    exports: [UsersService],

})
export class UsersModule { }