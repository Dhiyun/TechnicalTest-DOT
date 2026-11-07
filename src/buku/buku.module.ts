import { Module } from '@nestjs/common';
import { BukuService } from './buku.service.js';
import { BukuController } from './buku.controller.js';

@Module({
  controllers: [BukuController],
  providers: [BukuService],
})
export class BukuModule {}
