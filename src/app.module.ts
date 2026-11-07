import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { KategoriModule } from './kategori/kategori.module.js';
import { BukuModule } from './buku/buku.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    KategoriModule,
    BukuModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
