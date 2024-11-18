// src/config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'pakistan001*',
    database: process.env.DB_NAME || 'glutgut',
    entities: ['dist/**/*.entity{.ts,.js}'],
    //synchronize: process.env.NODE_ENV !== 'production', // Don't use synchronize in production
    logging: process.env.NODE_ENV !== 'production',
    //entities: ['src/entities/*.entity{.ts,.js}'], // Paths to your entity files
    migrations: ['src/database/migrations/*{.ts,.js}'], // Paths to your migration files
    synchronize: false, // Disable automatic schema synchronization (not recommended for production)
    migrationsRun: false, // Disable automatic migration run (you'll need to run migrations manually)
    migrationsTableName: 'migrations',
}));