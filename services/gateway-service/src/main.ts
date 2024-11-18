import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';

async function bootstrap() {
    const app = await NestFactory.create(GatewayModule);
    // Enable CORS
    app.enableCors();
    await app.listen(8800);
    console.log(`Gateway is running on: ${await app.getUrl()}`);
}
bootstrap();