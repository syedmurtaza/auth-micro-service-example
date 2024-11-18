"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => ({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'pakistan001*',
    database: process.env.DB_NAME || 'glutgut',
    entities: ['dist/**/*.entity{.ts,.js}'],
    logging: process.env.NODE_ENV !== 'production',
    migrations: ['src/database/migrations/*{.ts,.js}'],
    synchronize: false,
    migrationsRun: false,
    migrationsTableName: 'migrations',
}));
//# sourceMappingURL=database.config.js.map