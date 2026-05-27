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
import { NoticesService } from './notices.service';
import { CreateNoticeDto, UpdateNoticeDto } from '../../dtos/notice.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('notices')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateNoticeDto) {
    return this.noticesService.create(dto);
  }

  @Get()
  @Roles('admin', 'user')
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.noticesService.findAll(page ? +page : 1, limit ? +limit : 20);
  }

  @Get(':id')
  @Roles('admin', 'user')
  findOne(@Param('id') id: string) {
    return this.noticesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateNoticeDto) {
    return this.noticesService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.noticesService.remove(+id);
  }
}
