import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest } from '../../entities/guest.entity';
import { CreateGuestDto, UpdateGuestDto } from '../../dtos/guest.dto';

@Injectable()
export class GuestsService {
  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
  ) {}

  async create(dto: CreateGuestDto): Promise<Guest> {
    const guest = this.guestRepository.create(dto);
    return this.guestRepository.save(guest);
  }

  async findByReservation(reservationId: number): Promise<Guest[]> {
    return this.guestRepository.find({
      where: { reservationId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Guest> {
    const guest = await this.guestRepository.findOne({ where: { id } });
    if (!guest) {
      throw new NotFoundException(`Guest with id ${id} not found`);
    }
    return guest;
  }

  async update(id: number, dto: UpdateGuestDto): Promise<Guest> {
    const guest = await this.findOne(id);
    Object.assign(guest, dto);
    return this.guestRepository.save(guest);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.guestRepository.delete(id);
  }
}
