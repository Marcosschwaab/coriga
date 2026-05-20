import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum HolidayType {
  NATIONAL = 'national',
  MUNICIPAL = 'municipal',
  CONDOMINIUM = 'condominium',
}

@Entity('holidays')
export class Holiday {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'date' })
  date: string;

  @Column({
    type: 'simple-enum',
    enum: HolidayType,
    default: HolidayType.NATIONAL,
  })
  type: HolidayType;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
