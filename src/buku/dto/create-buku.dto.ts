import { z } from 'zod';

export const createBukuSchema = z.object({
    kategoriId: z.string().min(1, { message: 'Kategori wajib harus diisi' }),
    judul: z.string().trim().min(1, { message: 'Judul wajib harus diisi' }),
    pengarang: z.string().trim().min(1, { message: 'Pengarang wajib harus diisi' }),
    tahun_terbit: z.number().int().min(1, { message: 'Tahun terbit di atas 1000' }).optional().nullable(),
    stok: z.number().int().min(0, { message: 'Stok wajib harus diisi' }),
})
export type CreateBukuDto = z.infer<typeof createBukuSchema>;
