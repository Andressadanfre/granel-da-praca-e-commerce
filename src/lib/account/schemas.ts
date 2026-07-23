import { z } from 'zod'

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Informe seu nome completo').max(120),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, '').length >= 10 && v.replace(/\D/g, '').length <= 11, {
      message: 'Informe um WhatsApp válido',
    })
    .max(20),
})
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const changePasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(72),
})
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const prepareReorderSchema = z.object({
  orderId: z.string().uuid('Pedido inválido'),
})
export type PrepareReorderInput = z.infer<typeof prepareReorderSchema>
