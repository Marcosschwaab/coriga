import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { Resident } from '../../entities/resident.entity';
import { Payment } from '../../entities/payment.entity';
import { PricingConfig } from '../../entities/pricing-config.entity';
import { Holiday } from '../../entities/holiday.entity';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Resident, Payment, PricingConfig, Holiday])],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
