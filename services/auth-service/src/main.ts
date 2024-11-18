import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AuthModule } from './auth.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {
        transport: Transport.TCP,
        options: {
            host: '127.0.0.1',
            port: 8878,
        },
    });
    await app.listen();
    console.log('Auth microservice is running...');
}
bootstrap();