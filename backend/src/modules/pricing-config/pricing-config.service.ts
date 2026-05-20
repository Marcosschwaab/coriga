import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricingConfig } from '../../entities/pricing-config.entity';
import { UpdatePricingConfigDto } from '../../dtos/pricing-config.dto';

@Injectable()
export class PricingConfigService {
  constructor(
    @InjectRepository(PricingConfig)
    private readonly pricingConfigRepository: Repository<PricingConfig>,
  ) {}

  async getConfig(): Promise<PricingConfig> {
    const configs = await this.pricingConfigRepository.find({
      order: { updatedAt: 'DESC' },
      take: 1,
    });
    let config = configs[0];
    if (!config) {
      config = this.pricingConfigRepository.create({
        weekdayPrice: 100,
        weekendPrice: 150,
        holidayPrice: 200,
      });
      await this.pricingConfigRepository.save(config);
    }
    return config;
  }

  async updateConfig(dto: UpdatePricingConfigDto): Promise<PricingConfig> {
    const config = await this.getConfig();
    Object.assign(config, dto);
    return this.pricingConfigRepository.save(config);
  }
}
