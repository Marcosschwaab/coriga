import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Recipient } from './recipient.entity';

@Entity('packages')
export class PackageOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  codigoRastreio: string;

  @ManyToOne(() => Recipient, (recipient) => recipient.packages)
  @JoinColumn({ name: 'recipientId' })
  recipient: Recipient;

  @Column()
  recipientId: number;

  @Column({ type: 'date' })
  dataRecebimento: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
