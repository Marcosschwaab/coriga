import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThanOrEqual, LessThanOrEqual, MoreThan } from 'typeorm';
import { Reservation, ReservationStatus, DayType } from '../../entities/reservation.entity';
import { Resident } from '../../entities/resident.entity';
import { Payment, PaymentStatus } from '../../entities/payment.entity';
import { PricingConfig } from '../../entities/pricing-config.entity';
import { Holiday } from '../../entities/holiday.entity';
import { CreateReservationDto, UpdateReservationDto } from '../../dtos/reservation.dto';
import { PaginatedResult } from '../../dtos/pagination';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Resident)
    private readonly residentRepository: Repository<Resident>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PricingConfig)
    private readonly pricingConfigRepository: Repository<PricingConfig>,
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
  ) {}

  private async getDayType(date: string): Promise<DayType> {
    const holiday = await this.holidayRepository.findOne({ where: { date } });
    if (holiday) {
      return DayType.HOLIDAY;
    }
    const [year, month, day] = date.split('-').map(Number);
    const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return DayType.WEEKEND;
    }
    return DayType.WEEKDAY;
  }

  private async getPriceForDayType(dayType: DayType): Promise<number> {
    const configs = await this.pricingConfigRepository.find({ order: { updatedAt: 'DESC' }, take: 1 });
    const config = configs[0];
    if (!config) {
      const defaultConfig = this.pricingConfigRepository.create({
        weekdayPrice: 100,
        weekendPrice: 150,
        holidayPrice: 200,
      });
      await this.pricingConfigRepository.save(defaultConfig);
      return dayType === DayType.WEEKDAY ? 100 : dayType === DayType.WEEKEND ? 150 : 200;
    }
    switch (dayType) {
      case DayType.WEEKEND:
        return Number(config.weekendPrice);
      case DayType.HOLIDAY:
        return Number(config.holidayPrice);
      default:
        return Number(config.weekdayPrice);
    }
  }

  async create(dto: CreateReservationDto): Promise<Reservation> {
    const resident = await this.residentRepository.findOne({ where: { id: dto.residentId } });
    if (!resident) {
      throw new NotFoundException(`Resident with id ${dto.residentId} not found`);
    }
    if (!resident.isActive) {
      throw new BadRequestException('Cannot create reservation for inactive resident');
    }

    const existing = await this.reservationRepository.findOne({ where: { date: dto.date } });
    if (existing) {
      throw new ConflictException(`Reservation already exists for date ${dto.date}`);
    }

    const dayType = dto.dayType || await this.getDayType(dto.date);
    const price = dto.price || await this.getPriceForDayType(dayType);

    const reservation = this.reservationRepository.create({
      ...dto,
      dayType,
      price,
    });
    const saved = await this.reservationRepository.save(reservation);

    const payment = this.paymentRepository.create({
      reservation: saved,
      totalAmount: price,
      paidAmount: 0,
      remainingAmount: price,
      status: PaymentStatus.PENDING,
    });
    await this.paymentRepository.save(payment);

    saved.paymentId = payment.id;
    return this.reservationRepository.save(saved);
  }

  async findAll(month?: string, status?: string, page = 1, limit = 20): Promise<PaginatedResult<Reservation>> {
    const qb = this.reservationRepository.createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.resident', 'resident')
      .leftJoinAndSelect('reservation.payment', 'payment');

    if (month) {
      const start = `${month}-01`;
      const endDate = new Date(start);
      endDate.setMonth(endDate.getMonth() + 1);
      const end = endDate.toISOString().split('T')[0];
      qb.where('reservation.date >= :start AND reservation.date < :end', { start, end });
    }

    if (status) {
      qb.andWhere('reservation.status = :status', { status });
    }

    qb.orderBy('reservation.date', 'ASC');
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['resident', 'payment'],
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation with id ${id} not found`);
    }
    return reservation;
  }

  async update(id: number, dto: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (dto.residentId && dto.residentId !== reservation.residentId) {
      const resident = await this.residentRepository.findOne({ where: { id: dto.residentId } });
      if (!resident) {
        throw new NotFoundException(`Resident with id ${dto.residentId} not found`);
      }
      if (!resident.isActive) {
        throw new BadRequestException('Cannot assign reservation to inactive resident');
      }
    }

    if (dto.date && dto.date !== reservation.date) {
      const existing = await this.reservationRepository.findOne({ where: { date: dto.date } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Reservation already exists for date ${dto.date}`);
      }
    }

    Object.assign(reservation, dto);
    return this.reservationRepository.save(reservation);
  }

  async cancel(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);
    reservation.status = ReservationStatus.CANCELLED;
    const saved = await this.reservationRepository.save(reservation);

    if (reservation.payment) {
      reservation.payment.status = PaymentStatus.CANCELLED;
      await this.paymentRepository.save(reservation.payment);
    }

    return saved;
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Reservation[]> {
    return this.reservationRepository.createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.resident', 'resident')
      .leftJoinAndSelect('reservation.payment', 'payment')
      .where('reservation.date >= :start AND reservation.date <= :end', { start: startDate, end: endDate })
      .orderBy('reservation.date', 'ASC')
      .getMany();
  }
}
