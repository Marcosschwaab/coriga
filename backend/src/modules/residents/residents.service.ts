import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resident } from '../../entities/resident.entity';
import { CreateResidentDto, UpdateResidentDto } from '../../dtos/resident.dto';

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

  async findAll(search?: string): Promise<Resident[]> {
    const qb = this.residentRepository.createQueryBuilder('resident');
    if (search) {
      qb.where(
        'resident.name LIKE :search OR resident.phone LIKE :search OR resident.address LIKE :search',
        { search: `%${search}%` },
      );
    }
    return qb.getMany();
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
