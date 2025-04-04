import * as z from 'zod';
import type { Role } from '@/types';

export const signUpSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces'),
    phone: z
      .string()
      .regex(/^\+639\d{9}$/, 'Phone number must be in format: +639XXXXXXXXX'),
    role: z.enum(['passenger', 'conductor', 'admin'] as const),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    birthdate: z.string().refine(
      date => {
        const today = new Date();
        const birthDate = new Date(date);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        return age >= 18;
      },
      { message: 'You must be at least 18 years old' }
    ),
    gender: z.enum(['male', 'female', 'other'] as const)
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;
