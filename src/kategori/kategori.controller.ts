import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseFilters,
  Render,
  Req,
  Res,
  Query,
  ConflictException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { JwtAuthGuard, type JwtPayload } from '../auth/jwt-auth.guard.js';
import { KategoriService } from './kategori.service.js';
import {
  createKategoriSchema,
  type CreateKategoriDto,
} from './dto/create-kategori.dto.js';
import {
  updateKategoriSchema,
  type UpdateKategoriDto,
} from './dto/update-kategori.dto.js';
import { RedirectToLoginFilter } from '../auth/redirect-to-login.filter.js';
import { bacaHalaman, buatPagination } from '../common/pagination.js';

type RequestLogin = Request & { user: JwtPayload };

@Controller()
@UseGuards(JwtAuthGuard)
export class KategoriController {
  constructor(private readonly kategoriService: KategoriService) {}

  @Post('kategori')
  create(
    @Body({ schema: createKategoriSchema })
    createKategoriDto: CreateKategoriDto,
  ) {
    return this.kategoriService.create(createKategoriDto);
  }

  @Get('kategori')
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const halaman = bacaHalaman(page, limit);
    return this.kategoriService.findAll(search?.trim(), halaman);
  }

  @Get('kategori/:id')
  findOne(@Param('id') id: string) {
    return this.kategoriService.findOne(id);
  }

  @Patch('kategori/:id')
  update(
    @Param('id') id: string,
    @Body({ schema: updateKategoriSchema })
    updateKategoriDto: UpdateKategoriDto,
  ) {
    return this.kategoriService.update(id, updateKategoriDto);
  }

  @Delete('kategori/:id')
  remove(@Param('id') id: string) {
    return this.kategoriService.remove(id);
  }

  @Get('admin/kategori')
  @UseFilters(RedirectToLoginFilter)
  @Render('kategori/index')
  async index(
    @Req() req: RequestLogin,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pesan') pesan?: string,
    @Query('error') error?: string,
  ) {
    const kataKunci = search?.trim();
    const hasil = await this.kategoriService.findAll(
      kataKunci,
      bacaHalaman(page),
    );
    return {
      title: 'Kategori',
      user: req.user,
      kategori: hasil.data,
      pagination: buatPagination('/admin/kategori', hasil.meta, kataKunci),
      search: kataKunci,
      pesan,
      error,
    };
  }

  @Get('admin/kategori/tambah')
  @UseFilters(RedirectToLoginFilter)
  @Render('kategori/form')
  halamanTambah(@Req() req: RequestLogin) {
    return {
      title: 'Tambah Kategori',
      user: req.user,
      action: '/admin/kategori',
      kategori: {},
    };
  }

  @Post('admin/kategori')
  @UseFilters(RedirectToLoginFilter)
  async simpan(
    @Req() req: RequestLogin,
    @Body() body: Record<string, string>,
    @Res() res: Response,
  ) {
    const hasil = bacaFormKategori(body);
    if (!hasil.success) {
      return res.status(400).render('kategori/form', {
        title: 'Tambah Kategori',
        user: req.user,
        action: '/admin/kategori',
        kategori: body,
        errors: z.flattenError(hasil.error).fieldErrors,
      });
    }

    await this.kategoriService.create(hasil.data);
    return res.redirect(
      `/admin/kategori?pesan=${encodeURIComponent('Kategori berhasil ditambahkan')}`,
    );
  }

  @Get('admin/kategori/:id')
  @UseFilters(RedirectToLoginFilter)
  @Render('kategori/show')
  async detail(@Req() req: RequestLogin, @Param('id') id: string) {
    return {
      title: 'Detail Kategori',
      user: req.user,
      kategori: await this.kategoriService.findOne(id),
    };
  }

  @Get('admin/kategori/:id/edit')
  @UseFilters(RedirectToLoginFilter)
  @Render('kategori/form')
  async halamanEdit(@Req() req: RequestLogin, @Param('id') id: string) {
    return {
      title: 'Edit Kategori',
      user: req.user,
      action: `/admin/kategori/${id}/edit`,
      kategori: await this.kategoriService.findOne(id),
    };
  }

  @Post('admin/kategori/:id/edit')
  @UseFilters(RedirectToLoginFilter)
  async ubah(
    @Req() req: RequestLogin,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
    @Res() res: Response,
  ) {
    const hasil = bacaFormKategori(body);
    if (!hasil.success) {
      return res.status(400).render('kategori/form', {
        title: 'Edit Kategori',
        user: req.user,
        action: `/admin/kategori/${id}/edit`,
        kategori: body,
        errors: z.flattenError(hasil.error).fieldErrors,
      });
    }

    await this.kategoriService.update(id, hasil.data);
    return res.redirect(
      `/admin/kategori?pesan=${encodeURIComponent('Kategori berhasil diubah')}`,
    );
  }

  @Post('admin/kategori/:id/hapus')
  @UseFilters(RedirectToLoginFilter)
  async hapus(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.kategoriService.remove(id);
      return res.redirect(
        `/admin/kategori?pesan=${encodeURIComponent('Kategori berhasil dihapus')}`,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        return res.redirect(
          `/admin/kategori?error=${encodeURIComponent(error.message)}`,
        );
      }
      throw error;
    }
  }
}

function bacaFormKategori(body: Record<string, string>) {
  return createKategoriSchema.safeParse({
    nama: body.nama,
    deskripsi: body.deskripsi?.trim() || null,
  });
}
