import { DataSource } from 'typeorm';

import * as dotenv from 'dotenv';
dotenv.config();

/**
 * TypeORM CLI data source for migration generation & running.
 *
 * Usage:
 *   npx typeorm migration:generate -d src/database/data-source.ts src/database/migrations/Init
 *   npx typeorm migration:run -d src/database/data-source.ts
 *   npx typeorm migration:revert -d src/database/data-source.ts
 */
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../**/*.entity{.ts,.js}', 'dist/**/*.entity.js', 'src/**/*.entity.ts'],
  migrations: [__dirname + '/migrations/*{.ts,.js}', 'dist/database/migrations/*.js', 'src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
