import { z } from 'zod';
import { createBukuSchema } from './create-buku.dto.js';

export const updateBukuSchema = createBukuSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Field Wajib Diisi',
  });
export type UpdateBukuDto = z.infer<typeof updateBukuSchema>;
