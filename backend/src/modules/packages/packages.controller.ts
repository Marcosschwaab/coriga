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
import { PackagesService } from './packages.service';
import { CreateRecipientDto, UpdateRecipientDto } from '../../dtos/recipient.dto';
import { CreatePackageOrderDto, UpdatePackageOrderDto } from '../../dtos/package-order.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('packages')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post('recipients')
  @Roles('admin', 'concierge')
  createRecipient(@Body() dto: CreateRecipientDto) {
    return this.packagesService.createRecipient(dto);
  }

  @Get('recipients')
  @Roles('admin', 'user', 'concierge')
  findAllRecipients(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.packagesService.findAllRecipients(search, page ? +page : 1, limit ? +limit : 50);
  }

  @Get('recipients/:id')
  @Roles('admin', 'user', 'concierge')
  findOneRecipient(@Param('id') id: string) {
    return this.packagesService.findOneRecipient(+id);
  }

  @Patch('recipients/:id')
  @Roles('admin', 'concierge')
  updateRecipient(@Param('id') id: string, @Body() dto: UpdateRecipientDto) {
    return this.packagesService.updateRecipient(+id, dto);
  }

  @Delete('recipients/:id')
  @Roles('admin', 'concierge')
  removeRecipient(@Param('id') id: string) {
    return this.packagesService.removeRecipient(+id);
  }

  @Post()
  @Roles('admin', 'concierge')
  createPackage(@Body() dto: CreatePackageOrderDto) {
    return this.packagesService.createPackage(dto);
  }

  @Get()
  @Roles('admin', 'user', 'concierge')
  findAllPackages(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.packagesService.findAllPackages(search, page ? +page : 1, limit ? +limit : 50);
  }

  @Get(':id')
  @Roles('admin', 'user', 'concierge')
  findOnePackage(@Param('id') id: string) {
    return this.packagesService.findOnePackage(+id);
  }

  @Patch(':id')
  @Roles('admin', 'concierge')
  updatePackage(@Param('id') id: string, @Body() dto: UpdatePackageOrderDto) {
    return this.packagesService.updatePackage(+id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'concierge')
  removePackage(@Param('id') id: string) {
    return this.packagesService.removePackage(+id);
  }
}
