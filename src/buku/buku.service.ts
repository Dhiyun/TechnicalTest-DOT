import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBukuDto } from './dto/create-buku.dto.js';
import { UpdateBukuDto } from './dto/update-buku.dto.js';
import type { Prisma } from '../generated/prisma/client.js';
import { buatMeta, type Halaman } from '../common/pagination.js';

@Injectable()
export class BukuService {
  constructor(private readonly prisma: PrismaService) {}

  private async cekKategori(kategoriId: string) {
    const kategori = await this.prisma.kategori.findUnique({
      where: { id: kategoriId },
    });
    if (!kategori) {
      throw new BadRequestException(
        `Kategori dengan id ${kategoriId} tidak ditemukan`,
      );
    }
  }

  async create(createBukuDto: CreateBukuDto) {
    await this.cekKategori(createBukuDto.kategoriId);
    return this.prisma.buku.create({ data: createBukuDto });
  }

  async findAll(search: string | undefined, halaman: Halaman) {
    const where: Prisma.bukuWhereInput = search
      ? {
          OR: [
            { judul: { contains: search, mode: 'insensitive' } },
            { pengarang: { contains: search, mode: 'insensitive' } },
            { kategori: { nama: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.buku.findMany({
        where,
        orderBy: { judul: 'asc' },
        include: { kategori: { select: { id: true, nama: true } } },
        skip: (halaman.page - 1) * halaman.limit,
        take: halaman.limit,
      }),
      this.prisma.buku.count({ where }),
    ]);

    return { data, meta: buatMeta(total, halaman) };
  }

  async findOne(id: string) {
    const buku = await this.prisma.buku.findUnique({
      where: { id },
      include: { kategori: true },
    });
    if (!buku) {
      throw new NotFoundException(`Buku tidak ada`);
    }

    return buku;
  }

  async update(id: string, updateBukuDto: UpdateBukuDto) {
    await this.findOne(id);

    if (updateBukuDto.kategoriId) {
      await this.cekKategori(updateBukuDto.kategoriId);
    }

    return this.prisma.buku.update({ where: { id }, data: updateBukuDto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.buku.delete({ where: { id } });
  }

  listKategori() {
    return this.prisma.kategori.findMany({
      select: { id: true, nama: true },
      orderBy: { nama: 'asc' },
    });
  }
}
