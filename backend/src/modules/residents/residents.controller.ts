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
import { ResidentsService } from './residents.service';
import { CreateResidentDto, UpdateResidentDto } from '../../dtos/resident.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('residents')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ResidentsController {
  constructor(private readonly residentsService: ResidentsService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateResidentDto) {
    return this.residentsService.create(dto);
  }

  @Get()
  @Roles('admin', 'user')
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.residentsService.findAll(search, page ? +page : 1, limit ? +limit : 20);
  }

  @Get(':id')
  @Roles('admin', 'user')
  findOne(@Param('id') id: string) {
    return this.residentsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateResidentDto) {
    return this.residentsService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.residentsService.remove(+id);
  }
}
