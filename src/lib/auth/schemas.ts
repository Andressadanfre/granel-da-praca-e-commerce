import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  name: z.string().min(2, 'Informe seu nome completo'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  termsAccepted: z.literal(true, {
    message: 'Você precisa aceitar os Termos de Uso e a Política de Privacidade.',
  }),
  marketingOptIn: z.boolean().default(false),
})
export type SignupInput = z.infer<typeof signupSchema>
