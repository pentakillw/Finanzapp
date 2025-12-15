import { z } from 'zod'

export const signUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  user_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  currency: z.enum(['MXN', 'USD', 'EUR'])
})
