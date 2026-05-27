import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipient } from '../../entities/recipient.entity';
import { PackageOrder } from '../../entities/package-order.entity';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Recipient, PackageOrder])],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
