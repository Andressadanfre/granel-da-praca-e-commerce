import { z } from 'zod'

/**
 * Schema de input da edição de produto.
 * NÃO inclui productType, incrementGrams nem slug — excluídos estruturalmente
 * (mesmo se enviados no body, o Zod os ignora / rejeita pelo strip padrão).
 */
export const updateProductSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(200, 'Nome deve ter no máximo 200 caracteres'),
    categoryId: z.number().int().positive('Categoria inválida'),
    description: z.string().max(2000, 'Descrição deve ter no máximo 2000 caracteres').optional().nullable(),
    priceCents: z.number().int().positive('Preço deve ser um valor positivo'),
    compareAtCents: z.number().int().positive('Preço original deve ser um valor positivo').optional().nullable(),
    stockQuantityGrams: z.number().int().min(0).optional().nullable(),
    stockQuantityUnits: z.number().int().min(0).optional().nullable(),
    lowStockThresholdGrams: z.number().int().min(0),
    lowStockThresholdUnits: z.number().int().min(0),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.compareAtCents != null && data.compareAtCents <= data.priceCents) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Preço original deve ser maior que o preço atual',
        path: ['compareAtCents'],
      })
    }
  })

export type UpdateProductInput = z.infer<typeof updateProductSchema>
