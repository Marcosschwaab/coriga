import {
  Controller,
  Get,
  Patch,
  Body,
} from '@nestjs/common';
import { PricingConfigService } from './pricing-config.service';
import { UpdatePricingConfigDto } from '../../dtos/pricing-config.dto';

@Controller('pricing-config')
export class PricingConfigController {
  constructor(private readonly pricingConfigService: PricingConfigService) {}

  @Get()
  getConfig() {
    return this.pricingConfigService.getConfig();
  }

  @Patch()
  updateConfig(@Body() dto: UpdatePricingConfigDto) {
    return this.pricingConfigService.updateConfig(dto);
  }
}
