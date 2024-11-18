"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const users_module_1 = require("./users.module");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(users_module_1.UsersModule, {
        transport: microservices_1.Transport.TCP,
        options: {
            host: '127.0.0.1',
            port: 8879,
        },
    });
    await app.listen();
    console.log('Users microservice is running...');
}
bootstrap();
//# sourceMappingURL=main.js.map