import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { ResidentsModule } from '../src/modules/residents/residents.module';
import { ReservationsModule } from '../src/modules/reservations/reservations.module';
import { PaymentsModule } from '../src/modules/payments/payments.module';
import { HolidaysModule } from '../src/modules/holidays/holidays.module';
import { PricingConfigModule } from '../src/modules/pricing-config/pricing-config.module';
import { DashboardModule } from '../src/modules/dashboard/dashboard.module';
import { AuthModule } from '../src/modules/auth/auth.module';
import { NoticesModule } from '../src/modules/notices/notices.module';
import { GuestsModule } from '../src/modules/guests/guests.module';
import { PackagesModule } from '../src/modules/packages/packages.module';

export function createTestingModule(): TestingModuleBuilder {
  return Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [__dirname + '/../src/entities/*.entity{.ts,.js}'],
        synchronize: true,
        dropSchema: true,
      }),
      AuthModule,
      ResidentsModule,
      ReservationsModule,
      PaymentsModule,
      HolidaysModule,
      PricingConfigModule,
      DashboardModule,
      NoticesModule,
      GuestsModule,
      PackagesModule,
    ],
  });
}

export interface TestContext {
  app: INestApplication;
  httpServer: any;
  adminToken: string;
  userToken: string;
  conciergeToken: string;
}

export async function setupTestApp(): Promise<TestContext> {
  const moduleFixture = await createTestingModule().compile();
  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  const httpServer = app.getHttpServer();

  const adminRes = await supertest(httpServer)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'admin123' });

  const userRes = await supertest(httpServer)
    .post('/api/auth/login')
    .send({ username: 'user', password: 'user123' });

  const conciergeRes = await supertest(httpServer)
    .post('/api/auth/login')
    .send({ username: 'concierge', password: 'concierge123' });

  return {
    app,
    httpServer,
    adminToken: adminRes.body.access_token,
    userToken: userRes.body.access_token,
    conciergeToken: conciergeRes.body.access_token,
  };
}

export async function teardownTestApp(ctx: TestContext): Promise<void> {
  await ctx.app.close();
}

export const request = supertest;
