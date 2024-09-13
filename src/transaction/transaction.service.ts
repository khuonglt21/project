import { Injectable } from '@nestjs/common';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './transaction.schema';
import { ConfigService } from '@nestjs/config';
import { QueryDto } from './dto/query.dto';
import * as path from 'path';

@Injectable()
export class TransactionService {
  private apiKey: string;

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('API_KEY');
  }

  async parseCSV(): Promise<void> {
    const filePath = path.join(__dirname, '..', '..', 'donations.csv');
    const transactions = <any>[];
    const CHUNK_SIZE = 1000;

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          transactions.push({
            transaction_id: data.trans_no,
            transaction_note: data.detail,
            amount: parseFloat(data.credit),
          });

          if (transactions.length >= CHUNK_SIZE) {
            this.saveChunk(transactions.splice(0, CHUNK_SIZE)).catch(reject);
          }
        })
        .on('end', async () => {
          // Save any remaining transactions
          if (transactions.length > 0) {
            await this.saveChunk(transactions);
          }
          resolve();
        })
        .on('error', (error) => reject(error));
    });
  }

  private async saveChunk(donations: []): Promise<void> {
    await this.transactionModel.insertMany(donations);
    console.log('Chunk of donations saved.');
  }

  async findAll(querySto: QueryDto): Promise<Transaction[]> {
    const filter: Record<string, object> = {};

    if (querySto['amount:gt']) {
      filter.amount = { ...filter.amount, $gt: querySto['amount:gt'] };
    }

    if (querySto['amount:lt']) {
      filter.amount = { ...filter.amount, $lt: querySto['amount:lt'] };
    }

    if (querySto['note:like']) {
      filter['transaction_note'] = {
        $regex: querySto['note:like'],
        $options: 'i',
      };
    }

    const query = this.transactionModel.find(filter);

    if (querySto.limit) {
      return query.limit(querySto.limit).exec();
    }

    return query.exec();
  }

  async getSummary(): Promise<any> {
    const count = await this.transactionModel.countDocuments();
    const total = await this.transactionModel.aggregate([
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);
    const max = await this.transactionModel.findOne().sort('-amount').exec();
    const min = await this.transactionModel
      .findOne({ amount: { $gt: 0 } })
      .sort('amount')
      .exec();

    return {
      count,
      total: total[0]?.totalAmount || 0,
      max: max?.amount || 0,
      min: min?.amount || 0,
    };
  }
}
