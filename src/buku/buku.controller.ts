import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseFilters, Render, Req } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard, type JwtPayload } from '../auth/jwt-auth.guard.js';
import { BukuService } from './buku.service.js';
import { createBukuSchema, type CreateBukuDto } from './dto/create-buku.dto.js';
import { updateBukuSchema, type UpdateBukuDto } from './dto/update-buku.dto.js';
import { RedirectToLoginFilter } from '../auth/redirect-to-login.filter.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class BukuController {
  constructor(private readonly bukuService: BukuService) { }

  @Post('buku')
  create(@Body({ schema: createBukuSchema }) createBukuDto: CreateBukuDto) {
    return this.bukuService.create(createBukuDto);
  }

  @Get('buku')
  findAll() {
    return this.bukuService.findAll();
  }

  @Get('buku/:id')
  findOne(@Param('id') id: string) {
    return this.bukuService.findOne(id);
  }

  @Patch('buku/:id')
  update(@Param('id') id: string, @Body({ schema: updateBukuSchema }) updateBukuDto: UpdateBukuDto) {
    return this.bukuService.update(id, updateBukuDto);
  }

  @Delete('buku/:id')
  remove(@Param('id') id: string) {
    return this.bukuService.remove(id);
  }

  @Get('admin/buku')
  @UseFilters(RedirectToLoginFilter)
  @Render('buku/index')
  async index(@Req() req: Request & { user: JwtPayload }) {
    return {
      title: 'Buku',
      user: req.user,
      buku: await this.bukuService.findAll(),
    }
  }
}
