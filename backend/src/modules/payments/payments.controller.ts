import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto } from '../../dtos/payment.dto';
import { PaymentMethod } from '../../entities/payment.entity';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.paymentsService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(+id, dto);
  }

  @Post(':id/record')
  recordPayment(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Body('method') method: PaymentMethod,
  ) {
    return this.paymentsService.recordPayment(+id, amount, method);
  }
}
