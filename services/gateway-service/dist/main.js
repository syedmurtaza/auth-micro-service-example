"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const gateway_module_1 = require("./gateway.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(gateway_module_1.GatewayModule);
    app.enableCors();
    await app.listen(8800);
    console.log(`Gateway is running on: ${await app.getUrl()}`);
}
bootstrap();
//# sourceMappingURL=main.js.map