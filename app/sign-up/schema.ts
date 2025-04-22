import * as z from 'zod';
import type { Role } from '@/types';

export const signUpSchema = z
  .object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    name: z.string().min(1, 'Full name is required'),
    phone: z
      .string()
      .regex(
        /^(09|\+639)\d{9}$/,
        'Phone number must be in format: 09XXXXXXXXX or +639XXXXXXXXX'
      ),
    role: z.enum(['passenger', 'conductor', 'admin'] as const),
    houseNumber: z.string().optional(),
    street: z.string().optional(),
    regionCode: z.string().optional(),
    regionName: z.string().optional(),
    provinceCode: z.string().optional(),
    provinceName: z.string().optional(),
    cityCode: z.string().optional(),
    cityName: z.string().optional(),
    barangayCode: z.string().optional(),
    barangayName: z.string().optional(),
    postalCode: z.string().optional(),
    birthdate: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['male', 'female', 'other'] as const),
    address: z.string().optional()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;
