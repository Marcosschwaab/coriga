import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PackageOrder } from './package-order.entity';

@Entity('recipients')
export class Recipient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  endereco: string;

  @Column()
  cep: string;

  @Column()
  cidade: string;

  @Column()
  bairro: string;

  @OneToMany(() => PackageOrder, (pkg) => pkg.recipient)
  packages: PackageOrder[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
