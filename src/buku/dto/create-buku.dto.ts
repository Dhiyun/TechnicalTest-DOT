import { z } from 'zod';

export const createBukuSchema = z.object({
  kategoriId: z
    .string({ message: 'Kategori harus diisi' })
    .min(1, { message: 'Kategori harus diisi' }),
  judul: z
    .string({ message: 'Judul harus diisi' })
    .trim()
    .min(1, { message: 'Judul harus diisi' }),
  pengarang: z
    .string({ message: 'Pengarang harus diisi' })
    .trim()
    .min(1, { message: 'Pengarang harus diisi' }),
  tahun_terbit: z
    .number()
    .int({ message: 'Tahun terbit harus bilangan bulat' })
    .min(1000, { message: 'Tahun terbit di atas 1000' })
    .optional()
    .nullable(),
  stok: z
    .number({ message: 'Stok harus diisi' })
    .int({ message: 'Stok harus bilangan bulat' })
    .min(0, { message: 'Stok tidak boleh mines' }),
});
export type CreateBukuDto = z.infer<typeof createBukuSchema>;
