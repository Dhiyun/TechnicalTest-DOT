import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseFilters, Render, Req, Res, Query } from '@nestjs/common';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { JwtAuthGuard, type JwtPayload } from '../auth/jwt-auth.guard.js';
import { BukuService } from './buku.service.js';
import { createBukuSchema, type CreateBukuDto } from './dto/create-buku.dto.js';
import { updateBukuSchema, type UpdateBukuDto } from './dto/update-buku.dto.js';
import { RedirectToLoginFilter } from '../auth/redirect-to-login.filter.js';
import { bacaHalaman, buatPagination } from '../common/pagination.js';

type RequestLogin = Request & { user: JwtPayload };

@Controller()
@UseGuards(JwtAuthGuard)
export class BukuController {
  constructor(private readonly bukuService: BukuService) { }

  @Post('buku')
  create(@Body({ schema: createBukuSchema }) createBukuDto: CreateBukuDto) {
    return this.bukuService.create(createBukuDto);
  }

  @Get('buku')
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const halaman = bacaHalaman(page, limit);
    return this.bukuService.findAll(search?.trim(), halaman);
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
  async index(
    @Req() req: RequestLogin,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pesan') pesan?: string,
    @Query('error') error?: string,
  ) {
    const kataKunci = search?.trim();
    const hasil = await this.bukuService.findAll(kataKunci, bacaHalaman(page));
    return {
      title: 'Buku',
      user: req.user,
      buku: hasil.data,
      pagination: buatPagination('/admin/buku', hasil.meta, kataKunci),
      search: kataKunci,
      pesan,
      error,
    };
  }

  @Get('admin/buku/tambah')
  @UseFilters(RedirectToLoginFilter)
  @Render('buku/form')
  halamanTambah(@Req() req: RequestLogin) {
    return this.dataForm(req, 'Tambah Buku', '/admin/buku', {});
  }

  @Post('admin/buku')
  @UseFilters(RedirectToLoginFilter)
  async simpan(@Req() req: RequestLogin, @Body() body: Record<string, string>, @Res() res: Response) {
    const hasil = bacaFormBuku(body);
    if (!hasil.success) {
      const errors = z.flattenError(hasil.error).fieldErrors;
      return res.status(400).render('buku/form', await this.dataForm(req, 'Tambah Buku', '/admin/buku', body, errors));
    }

    await this.bukuService.create(hasil.data);
    return res.redirect(`/admin/buku?pesan=${encodeURIComponent('Buku berhasil ditambahkan')}`);
  }

  @Get('admin/buku/:id')
  @UseFilters(RedirectToLoginFilter)
  @Render('buku/show')
  async detail(@Req() req: RequestLogin, @Param('id') id: string) {
    return {
      title: 'Detail Buku',
      user: req.user,
      buku: await this.bukuService.findOne(id),
    };
  }

  @Get('admin/buku/:id/edit')
  @UseFilters(RedirectToLoginFilter)
  @Render('buku/form')
  async halamanEdit(@Req() req: RequestLogin, @Param('id') id: string) {
    const buku = await this.bukuService.findOne(id);
    return this.dataForm(req, 'Edit Buku', `/admin/buku/${id}/edit`, buku);
  }

  @Post('admin/buku/:id/edit')
  @UseFilters(RedirectToLoginFilter)
  async ubah(@Req() req: RequestLogin, @Param('id') id: string, @Body() body: Record<string, string>, @Res() res: Response) {
    const hasil = bacaFormBuku(body);
    if (!hasil.success) {
      const errors = z.flattenError(hasil.error).fieldErrors;
      return res.status(400).render('buku/form', await this.dataForm(req, 'Edit Buku', `/admin/buku/${id}/edit`, body, errors));
    }

    await this.bukuService.update(id, hasil.data);
    return res.redirect(`/admin/buku?pesan=${encodeURIComponent('Buku berhasil diubah')}`);
  }

  @Post('admin/buku/:id/hapus')
  @UseFilters(RedirectToLoginFilter)
  async hapus(@Param('id') id: string, @Res() res: Response) {
    await this.bukuService.remove(id);
    return res.redirect(`/admin/buku?pesan=${encodeURIComponent('Buku berhasil dihapus')}`);
  }

  private async dataForm(req: RequestLogin, title: string, action: string, buku: object, errors?: object) {
    return {
      title,
      user: req.user,
      action,
      buku,
      errors,
      kategoriList: await this.bukuService.listKategori(),
    };
  }
}

function bacaFormBuku(body: Record<string, string>) {
  return createBukuSchema.safeParse({
    kategoriId: body.kategoriId,
    judul: body.judul,
    pengarang: body.pengarang,
    tahun_terbit: body.tahun_terbit?.trim() ? Number(body.tahun_terbit) : null,
    stok: body.stok?.trim() ? Number(body.stok) : undefined,
  });
}
