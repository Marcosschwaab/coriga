import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../../entities/reservation.entity';
import { Payment, PaymentStatus } from '../../entities/payment.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async getStats(month?: string) {
    const now = new Date();
    const year = now.getFullYear();
    const currentMonth = month ? parseInt(month.split('-')[1]) : now.getMonth() + 1;
    const monthStr = month || `${year}-${String(currentMonth).padStart(2, '0')}`;

    const start = `${monthStr}-01`;
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + 1);
    const end = endDate.toISOString().split('T')[0];

    const totalReservations = await this.reservationRepository.createQueryBuilder('reservation')
      .where('reservation.date >= :start AND reservation.date < :end', { start, end })
      .getCount();

    const confirmedReservations = await this.reservationRepository.createQueryBuilder('reservation')
      .where('reservation.date >= :start AND reservation.date < :end', { start, end })
      .andWhere('reservation.status = :status', { status: ReservationStatus.RESERVED })
      .getCount();

    const pendingPayments = await this.paymentRepository.createQueryBuilder('payment')
      .leftJoin('payment.reservation', 'reservation')
      .where('reservation.date >= :start AND reservation.date < :end', { start, end })
      .andWhere('payment.status IN (:...statuses)', {
        statuses: [PaymentStatus.PENDING, PaymentStatus.PARTIALLY_PAID],
      })
      .getCount();

    const upcomingReservations = await this.reservationRepository.createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.resident', 'resident')
      .leftJoinAndSelect('reservation.payment', 'payment')
      .where('reservation.date >= :today', { today: now.toISOString().split('T')[0] })
      .andWhere('reservation.status = :status', { status: ReservationStatus.RESERVED })
      .orderBy('reservation.date', 'ASC')
      .take(5)
      .getMany();

    const predictedRevenue = await this.paymentRepository.createQueryBuilder('payment')
      .leftJoin('payment.reservation', 'reservation')
      .where('reservation.date >= :start AND reservation.date < :end', { start, end })
      .select('SUM(payment.totalAmount)', 'total')
      .getRawOne();

    const receivedRevenue = await this.paymentRepository.createQueryBuilder('payment')
      .leftJoin('payment.reservation', 'reservation')
      .where('reservation.date >= :start AND reservation.date < :end', { start, end })
      .select('SUM(payment.paidAmount)', 'total')
      .getRawOne();

    return {
      totalReservations,
      confirmedReservations,
      pendingPayments,
      upcomingReservations,
      predictedRevenue: Number(predictedRevenue?.total || 0),
      receivedRevenue: Number(receivedRevenue?.total || 0),
    };
  }
}
