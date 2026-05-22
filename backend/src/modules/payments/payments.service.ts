import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from '../../entities/payment.entity';
import { Reservation, ReservationStatus } from '../../entities/reservation.entity';
import { CreatePaymentDto, UpdatePaymentDto } from '../../dtos/payment.dto';
import { PaginatedResult } from '../../dtos/pagination';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: dto.reservationId },
      relations: ['payment'],
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation with id ${dto.reservationId} not found`);
    }
    if (reservation.payment) {
      throw new BadRequestException('Payment already exists for this reservation');
    }

    const paidAmount = dto.paidAmount || 0;
    const remainingAmount = Number(dto.totalAmount) - paidAmount;
    let status = PaymentStatus.PENDING;
    if (paidAmount >= Number(dto.totalAmount)) {
      status = PaymentStatus.PAID;
    } else if (paidAmount > 0) {
      status = PaymentStatus.PARTIALLY_PAID;
    }

    const payment = this.paymentRepository.create({
      reservation,
      totalAmount: dto.totalAmount,
      paidAmount,
      remainingAmount,
      status,
      paymentMethod: dto.paymentMethod,
      paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
      notes: dto.notes,
    });
    return this.paymentRepository.save(payment);
  }

  async findAll(status?: string, page = 1, limit = 20): Promise<PaginatedResult<Payment>> {
    const qb = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.reservation', 'reservation')
      .leftJoinAndSelect('reservation.resident', 'resident');

    if (status) {
      qb.where('payment.status = :status', { status });
    }

    qb.orderBy('payment.createdAt', 'DESC');
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['reservation', 'reservation.resident'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }
    return payment;
  }

  async update(id: number, dto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);

    if (dto.paidAmount !== undefined) {
      payment.paidAmount = dto.paidAmount;
      payment.remainingAmount = Number(payment.totalAmount) - dto.paidAmount;

      if (dto.paidAmount >= Number(payment.totalAmount)) {
        payment.status = PaymentStatus.PAID;
        payment.paymentDate = payment.paymentDate || new Date();
      } else if (dto.paidAmount > 0) {
        payment.status = PaymentStatus.PARTIALLY_PAID;
      } else {
        payment.status = PaymentStatus.PENDING;
      }
    }

    if (dto.totalAmount !== undefined) {
      payment.totalAmount = dto.totalAmount;
      payment.remainingAmount = Number(dto.totalAmount) - Number(payment.paidAmount);
    }

    if (dto.paymentMethod) {
      payment.paymentMethod = dto.paymentMethod;
    }

    if (dto.paymentDate) {
      payment.paymentDate = new Date(dto.paymentDate);
    }

    if (dto.status) {
      payment.status = dto.status;
    }

    if (dto.notes !== undefined) {
      payment.notes = dto.notes;
    }

    return this.paymentRepository.save(payment);
  }

  async recordPayment(id: number, amount: number, method: PaymentMethod): Promise<Payment> {
    const payment = await this.findOne(id);

    if (Number(payment.paidAmount) + amount > Number(payment.totalAmount)) {
      throw new BadRequestException('Payment amount exceeds remaining balance');
    }

    payment.paidAmount = Number(payment.paidAmount) + amount;
    payment.remainingAmount = Number(payment.totalAmount) - Number(payment.paidAmount);
    payment.paymentMethod = method;
    payment.paymentDate = new Date();

    if (payment.remainingAmount <= 0) {
      payment.status = PaymentStatus.PAID;
    } else {
      payment.status = PaymentStatus.PARTIALLY_PAID;
    }

    return this.paymentRepository.save(payment);
  }
}
