import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResidentsModule } from './modules/residents/residents.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { HolidaysModule } from './modules/holidays/holidays.module';
import { PricingConfigModule } from './modules/pricing-config/pricing-config.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/database.sqlite',
      entities: [__dirname + '/entities/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ResidentsModule,
    ReservationsModule,
    PaymentsModule,
    HolidaysModule,
    PricingConfigModule,
    DashboardModule,
  ],
})
export class AppModule {}
