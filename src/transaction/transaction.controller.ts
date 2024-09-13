import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiKeyGuard } from '../guards/api_key.guard';
import { QueryDto } from './dto/query.dto';

@UseGuards(ApiKeyGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // For test service parseCSV
  @Post('/import-csv')
  async uploadCSV() {
    await this.transactionService.parseCSV();
    return 'Import CSV successful';
  }

  @Get()
  async findAll(@Query() query: QueryDto) {
    return await this.transactionService.findAll(query);
  }

  @Get('/summary')
  async getSummary() {
    return this.transactionService.getSummary();
  }
}
