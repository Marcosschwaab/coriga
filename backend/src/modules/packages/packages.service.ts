import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Recipient } from '../../entities/recipient.entity';
import { PackageOrder } from '../../entities/package-order.entity';
import { CreateRecipientDto, UpdateRecipientDto } from '../../dtos/recipient.dto';
import { CreatePackageOrderDto, UpdatePackageOrderDto } from '../../dtos/package-order.dto';
import { PaginatedResult } from '../../dtos/pagination';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Recipient)
    private readonly recipientRepository: Repository<Recipient>,
    @InjectRepository(PackageOrder)
    private readonly packageRepository: Repository<PackageOrder>,
  ) {}

  async createRecipient(dto: CreateRecipientDto): Promise<Recipient> {
    const recipient = this.recipientRepository.create(dto);
    return this.recipientRepository.save(recipient);
  }

  async findAllRecipients(search?: string, page = 1, limit = 50): Promise<PaginatedResult<Recipient>> {
    const qb = this.recipientRepository.createQueryBuilder('recipient');
    if (search) {
      qb.where('recipient.nome LIKE :search OR recipient.endereco LIKE :search OR recipient.bairro LIKE :search', { search: `%${search}%` });
    }
    qb.orderBy('recipient.nome', 'ASC');
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneRecipient(id: number): Promise<Recipient> {
    const recipient = await this.recipientRepository.findOne({ where: { id } });
    if (!recipient) {
      throw new NotFoundException(`Recipient with id ${id} not found`);
    }
    return recipient;
  }

  async updateRecipient(id: number, dto: UpdateRecipientDto): Promise<Recipient> {
    const recipient = await this.findOneRecipient(id);
    Object.assign(recipient, dto);
    return this.recipientRepository.save(recipient);
  }

  async removeRecipient(id: number): Promise<void> {
    await this.findOneRecipient(id);
    await this.recipientRepository.delete(id);
  }

  async createPackage(dto: CreatePackageOrderDto): Promise<PackageOrder> {
    const recipient = await this.findOneRecipient(dto.recipientId);
    const pkg = this.packageRepository.create({
      ...dto,
      recipient,
    });
    return this.packageRepository.save(pkg);
  }

  async findAllPackages(search?: string, page = 1, limit = 50): Promise<PaginatedResult<PackageOrder>> {
    const qb = this.packageRepository.createQueryBuilder('package')
      .leftJoinAndSelect('package.recipient', 'recipient');

    if (search) {
      qb.where('package.codigoRastreio LIKE :search OR recipient.nome LIKE :search', { search: `%${search}%` });
    }

    qb.orderBy('package.dataRecebimento', 'DESC');
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOnePackage(id: number): Promise<PackageOrder> {
    const pkg = await this.packageRepository.findOne({ where: { id }, relations: ['recipient'] });
    if (!pkg) {
      throw new NotFoundException(`Package with id ${id} not found`);
    }
    return pkg;
  }

  async updatePackage(id: number, dto: UpdatePackageOrderDto): Promise<PackageOrder> {
    const pkg = await this.findOnePackage(id);
    Object.assign(pkg, dto);
    return this.packageRepository.save(pkg);
  }

  async removePackage(id: number): Promise<void> {
    await this.findOnePackage(id);
    await this.packageRepository.delete(id);
  }
}
