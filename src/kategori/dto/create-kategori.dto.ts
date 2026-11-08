import { z } from 'zod';

export const createKategoriSchema = z.object({
    nama: z.string().trim().min(1, { message: 'Nama kategori wajib harus diisi' }),
    deskripsi: z.string().trim().optional().nullable(),
})
export type CreateKategoriDto = z.infer<typeof createKategoriSchema>;
