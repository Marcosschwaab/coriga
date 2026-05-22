import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holiday } from '../../entities/holiday.entity';
import { CreateHolidayDto, UpdateHolidayDto } from '../../dtos/holiday.dto';
import { PaginatedResult } from '../../dtos/pagination';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
  ) {}

  async create(dto: CreateHolidayDto): Promise<Holiday> {
    const holiday = this.holidayRepository.create(dto);
    return this.holidayRepository.save(holiday);
  }

  async findAll(year?: number, page = 1, limit = 20): Promise<PaginatedResult<Holiday>> {
    const qb = this.holidayRepository.createQueryBuilder('holiday');
    if (year) {
      qb.where("holiday.date LIKE :year", { year: `${year}%` });
    }
    qb.orderBy('holiday.date', 'ASC');
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<Holiday> {
    const holiday = await this.holidayRepository.findOne({ where: { id } });
    if (!holiday) {
      throw new NotFoundException(`Holiday with id ${id} not found`);
    }
    return holiday;
  }

  async update(id: number, dto: UpdateHolidayDto): Promise<Holiday> {
    const holiday = await this.findOne(id);
    Object.assign(holiday, dto);
    return this.holidayRepository.save(holiday);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.holidayRepository.delete(id);
  }

  async isHoliday(date: string): Promise<boolean> {
    const holiday = await this.holidayRepository.findOne({ where: { date } });
    return !!holiday;
  }
}
