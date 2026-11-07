import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { KategoriService } from './kategori.service.js';
import { createKategoriSchema, type CreateKategoriDto } from './dto/create-kategori.dto.js';
import { updateKategoriSchema, type UpdateKategoriDto } from './dto/update-kategori.dto.js';

@Controller('kategori')
@UseGuards(JwtAuthGuard)
export class KategoriController {
    constructor(private readonly kategoriService: KategoriService) { }

    @Post()
    create(@Body({ schema: createKategoriSchema }) dto: CreateKategoriDto) {
        return this.kategoriService.create(dto);
    }

    @Get()
    findAll() {
        return this.kategoriService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.kategoriService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body({ schema: updateKategoriSchema }) dto: UpdateKategoriDto) {
        return this.kategoriService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.kategoriService.remove(id);
    }
}
