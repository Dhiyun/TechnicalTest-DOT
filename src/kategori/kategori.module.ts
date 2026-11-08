import { Module } from '@nestjs/common';
import { KategoriService } from './kategori.service.js';
import { KategoriController } from './kategori.controller.js';

@Module({
  controllers: [KategoriController],
  providers: [KategoriService],
})
export class KategoriModule {}
