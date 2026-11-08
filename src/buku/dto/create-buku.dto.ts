import { z } from 'zod';

export const createBukuSchema = z.object({
    kategoriId: z.string({ message: 'Kategori wajib harus diisi' }).min(1, { message: 'Kategori wajib harus diisi' }),
    judul: z.string({ message: 'Judul wajib harus diisi' }).trim().min(1, { message: 'Judul wajib harus diisi' }),
    pengarang: z.string({ message: 'Pengarang wajib harus diisi' }).trim().min(1, { message: 'Pengarang wajib harus diisi' }),
    tahun_terbit: z.number().int().min(1000, { message: 'Tahun terbit di atas 1000' }).optional().nullable(),
    stok: z.number({ message: 'Stok wajib harus diisi' }).int({ message: 'Stok wajib harus diisi' }).min(0, { message: 'Stok wajib harus diisi' }),
})
export type CreateBukuDto = z.infer<typeof createBukuSchema>;
