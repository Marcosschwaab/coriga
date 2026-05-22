import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resident } from '../../entities/resident.entity';
import { CreateResidentDto, UpdateResidentDto } from '../../dtos/resident.dto';
import { PaginatedResult } from '../../dtos/pagination';

@Injectable()
export class ResidentsService {
  constructor(
    @InjectRepository(Resident)
    private readonly residentRepository: Repository<Resident>,
  ) {}

  async create(dto: CreateResidentDto): Promise<Resident> {
    const existing = await this.residentRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const resident = this.residentRepository.create(dto);
    return this.residentRepository.save(resident);
  }

  async findAll(search?: string, page = 1, limit = 20): Promise<PaginatedResult<Resident>> {
    const qb = this.residentRepository.createQueryBuilder('resident');
    if (search) {
      qb.where(
        'resident.name LIKE :search OR resident.phone LIKE :search OR resident.address LIKE :search',
        { search: `%${search}%` },
      );
    }
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<Resident> {
    const resident = await this.residentRepository.findOne({ where: { id } });
    if (!resident) {
      throw new NotFoundException(`Resident with id ${id} not found`);
    }
    return resident;
  }

  async update(id: number, dto: UpdateResidentDto): Promise<Resident> {
    const resident = await this.findOne(id);
    if (dto.email && dto.email !== resident.email) {
      const existing = await this.residentRepository.findOne({ where: { email: dto.email } });
      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }
    Object.assign(resident, dto);
    return this.residentRepository.save(resident);
  }

  async remove(id: number): Promise<void> {
    const resident = await this.findOne(id);
    resident.isActive = false;
    await this.residentRepository.save(resident);
  }
}
