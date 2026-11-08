import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateKategoriDto } from './dto/create-kategori.dto.js';
import { UpdateKategoriDto } from './dto/update-kategori.dto.js';
import type { Prisma } from '../generated/prisma/client.js';
import { buatMeta, type Halaman } from '../common/pagination.js';

@Injectable()
export class KategoriService {
    constructor(private readonly prisma: PrismaService) { }

    create(createKategoriDto: CreateKategoriDto) {
        return this.prisma.kategori.create({ data: createKategoriDto });
    }

    async findAll(search: string | undefined, halaman: Halaman) {
        const where: Prisma.kategoriWhereInput = search
            ? { nama: { contains: search, mode: 'insensitive' } }
            : {};

        const [data, total] = await this.prisma.$transaction([
            this.prisma.kategori.findMany({
                where,
                orderBy: { nama: 'asc' },
                include: { _count: { select: { buku: true } } },
                skip: (halaman?.page - 1) * halaman?.limit,
                take: halaman?.limit,
            }),
            this.prisma.kategori.count({ where }),
        ]);

        return { data, meta: buatMeta(total, halaman) };
    }

    async findOne(id: string) {
        const kategori = await this.prisma.kategori.findUnique({
            where: { id },
            include: { buku: { orderBy: { judul: 'asc' } } },
        });
        if (!kategori) {
            throw new NotFoundException(`Kategori tidak ada`);
        }
        return kategori;
    }

    async update(id: string, updateKategoriDto: UpdateKategoriDto) {
        await this.findOne(id);
        return this.prisma.kategori.update({ where: { id }, data: updateKategoriDto });
    }

    async remove(id: string) {
        await this.findOne(id);

        const jumlahBuku = await this.prisma.buku.count({ where: { kategoriId: id } });
        if (jumlahBuku > 0) {
            throw new ConflictException(`Kategori tidak bisa dihapus karena masih ada ${jumlahBuku} buku`);
        }

        return this.prisma.kategori.delete({ where: { id } });
    }
}