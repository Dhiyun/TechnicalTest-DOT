import { Inject } from '@nestjs/common';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateKategoriDto } from './dto/create-kategori.dto.js';
import { UpdateKategoriDto } from './dto/update-kategori.dto.js';

@Injectable()
export class KategoriService {
    constructor(@Inject(PrismaService) private readonly prisma: PrismaService) { }

    findAll() {
        return this.prisma.kategori.findMany({
            orderBy: { nama: 'asc' },
            include: { _count: { select: { buku: true } } },
        });
    }

    async findOne(id: string) {
        const kategori = await this.prisma.kategori.findUnique({
            where: { id },
            include: { buku: { orderBy: { judul: 'asc' } } },
        });
        if (!kategori) {
            throw new NotFoundException(`Kategori dengan tidak ada`);
        }
        return kategori;
    }

    create(dto: CreateKategoriDto) {
        return this.prisma.kategori.create({ data: dto });
    }

    async update(id: string, dto: UpdateKategoriDto) {
        await this.findOne(id);
        return this.prisma.kategori.update({ where: { id }, data: dto });
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