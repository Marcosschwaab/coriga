import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PricingConfigService } from './pricing-config.service';
import { UpdatePricingConfigDto } from '../../dtos/pricing-config.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('pricing-config')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PricingConfigController {
  constructor(private readonly pricingConfigService: PricingConfigService) {}

  @Get()
  @Roles('admin', 'user')
  getConfig() {
    return this.pricingConfigService.getConfig();
  }

  @Patch()
  @Roles('admin')
  updateConfig(@Body() dto: UpdatePricingConfigDto) {
    return this.pricingConfigService.updateConfig(dto);
  }
}
