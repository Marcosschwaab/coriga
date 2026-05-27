import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice } from '../../entities/notice.entity';
import { CreateNoticeDto, UpdateNoticeDto } from '../../dtos/notice.dto';
import { PaginatedResult } from '../../dtos/pagination';

@Injectable()
export class NoticesService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
  ) {}

  async create(dto: CreateNoticeDto): Promise<Notice> {
    const notice = this.noticeRepository.create(dto);
    return this.noticeRepository.save(notice);
  }

  async findAll(page = 1, limit = 20): Promise<PaginatedResult<Notice>> {
    const qb = this.noticeRepository.createQueryBuilder('notice');
    qb.orderBy('notice.createdAt', 'DESC');
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<Notice> {
    const notice = await this.noticeRepository.findOne({ where: { id } });
    if (!notice) {
      throw new NotFoundException(`Notice with id ${id} not found`);
    }
    return notice;
  }

  async update(id: number, dto: UpdateNoticeDto): Promise<Notice> {
    const notice = await this.findOne(id);
    Object.assign(notice, dto);
    return this.noticeRepository.save(notice);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.noticeRepository.delete(id);
  }
}
