import { z } from 'zod'

export const ExpenseSchema = z.object({
  id: z.string().uuid().optional(),
  amount: z.number().positive(),
  category: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  date: z.string().datetime(),
  business: z.enum(['aquatic', 'timepieces']),
})

export const SaleSchema = z.object({
  amount: z.number().positive(),
  item_id: z.string().uuid(),
  business: z.enum(['aquatic', 'timepieces']),
})

export type Expense = z.infer<typeof ExpenseSchema>
export type Sale = z.infer<typeof SaleSchema>