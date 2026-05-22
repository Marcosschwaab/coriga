import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HolidaysService } from './holidays.service';
import { CreateHolidayDto, UpdateHolidayDto } from '../../dtos/holiday.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('holidays')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateHolidayDto) {
    return this.holidaysService.create(dto);
  }

  @Get()
  @Roles('admin', 'user')
  findAll(
    @Query('year') year?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.holidaysService.findAll(year ? +year : undefined, page ? +page : 1, limit ? +limit : 20);
  }

  @Get(':id')
  @Roles('admin', 'user')
  findOne(@Param('id') id: string) {
    return this.holidaysService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateHolidayDto) {
    return this.holidaysService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.holidaysService.remove(+id);
  }
}
