import { z } from 'zod';
import { createKategoriSchema } from './create-kategori.dto.js';

export const updateKategoriSchema = createKategoriSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Field harus diisi',
  });
export type UpdateKategoriDto = z.infer<typeof updateKategoriSchema>;
