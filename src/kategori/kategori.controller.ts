import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseFilters, Render, Req } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard, type JwtPayload } from '../auth/jwt-auth.guard.js';
import { KategoriService } from './kategori.service.js';
import { createKategoriSchema, type CreateKategoriDto } from './dto/create-kategori.dto.js';
import { updateKategoriSchema, type UpdateKategoriDto } from './dto/update-kategori.dto.js';
import { RedirectToLoginFilter } from '../auth/redirect-to-login.filter.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class KategoriController {
    constructor(private readonly kategoriService: KategoriService) { }

    @Post('kategori')
    create(@Body({ schema: createKategoriSchema }) createKategoriDto: CreateKategoriDto) {
        return this.kategoriService.create(createKategoriDto);
    }

    @Get('kategori')
    findAll() {
        return this.kategoriService.findAll();
    }

    @Get('kategori/:id')
    findOne(@Param('id') id: string) {
        return this.kategoriService.findOne(id);
    }

    @Patch('kategori/:id')
    async update(@Param('id') id: string, @Body({ schema: updateKategoriSchema }) updateKategoriDto: UpdateKategoriDto) {
        return this.kategoriService.update(id, updateKategoriDto);
    }

    @Delete('kategori/:id')
    remove(@Param('id') id: string) {
        return this.kategoriService.remove(id);
    }

    @Get('admin/kategori')
    @UseFilters(RedirectToLoginFilter)
    @Render('kategori/index')
    async index(@Req() req: Request & { user: JwtPayload }) {
        return {
            title: 'Kategori',
            user: req.user,
            kategori: await this.kategoriService.findAll(),
        }
    }
}
