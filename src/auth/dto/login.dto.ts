import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ message: 'Format email tidak valid' }),
  password: z.string().min(1),
});
export type LoginDto = z.infer<typeof loginSchema>;
