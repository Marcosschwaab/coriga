import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GuestsService } from './guests.service';
import { CreateGuestDto, UpdateGuestDto } from '../../dtos/guest.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('guests')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Post()
  @Roles('admin', 'concierge')
  create(@Body() dto: CreateGuestDto) {
    return this.guestsService.create(dto);
  }

  @Get('reservation/:reservationId')
  @Roles('admin', 'user', 'concierge')
  findByReservation(@Param('reservationId') reservationId: string) {
    return this.guestsService.findByReservation(+reservationId);
  }

  @Get(':id')
  @Roles('admin', 'user', 'concierge')
  findOne(@Param('id') id: string) {
    return this.guestsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin', 'concierge')
  update(@Param('id') id: string, @Body() dto: UpdateGuestDto) {
    return this.guestsService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'concierge')
  remove(@Param('id') id: string) {
    return this.guestsService.remove(+id);
  }
}
