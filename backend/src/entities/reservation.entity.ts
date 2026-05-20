import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Resident } from './resident.entity';
import { Payment } from './payment.entity';

export enum ReservationStatus {
  RESERVED = 'reserved',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum DayType {
  WEEKDAY = 'weekday',
  WEEKEND = 'weekend',
  HOLIDAY = 'holiday',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Resident, (resident) => resident.reservations)
  @JoinColumn({ name: 'residentId' })
  resident: Resident;

  @Column()
  residentId: number;

  @Column({ type: 'date', unique: true })
  date: string;

  @Column({
    type: 'simple-enum',
    enum: ReservationStatus,
    default: ReservationStatus.RESERVED,
  })
  status: ReservationStatus;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'simple-enum',
    enum: DayType,
    default: DayType.WEEKDAY,
  })
  dayType: DayType;

  @OneToOne(() => Payment, (payment) => payment.reservation, { cascade: true })
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @Column({ nullable: true })
  paymentId: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
