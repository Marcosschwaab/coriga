import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pricing_config')
export class PricingConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 100.0 })
  weekdayPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 150.0 })
  weekendPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 200.0 })
  holidayPrice: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
