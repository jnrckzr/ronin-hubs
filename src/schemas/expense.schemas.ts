import { z } from "zod";

export const expenseSchema = z.object({
  amount: z.coerce.number().positive().min(0.01).max(1_000_000),

  category: z
    .string()
    .min(1, "Category is required")
    .max(100),

  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;