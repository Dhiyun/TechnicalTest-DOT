import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { BukuService } from './buku.service.js';
import { createBukuSchema, type CreateBukuDto } from './dto/create-buku.dto.js';
import { updateBukuSchema, type UpdateBukuDto } from './dto/update-buku.dto.js';

@Controller('buku')
@UseGuards(JwtAuthGuard)
export class BukuController {
  constructor(private readonly bukuService: BukuService) { }

  @Post()
  create(@Body({ schema: createBukuSchema }) createBukuDto: CreateBukuDto) {
    return this.bukuService.create(createBukuDto);
  }

  @Get()
  findAll() {
    return this.bukuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bukuService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body({ schema: updateBukuSchema }) updateBukuDto: UpdateBukuDto) {
    return this.bukuService.update(id, updateBukuDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bukuService.remove(id);
  }
}
