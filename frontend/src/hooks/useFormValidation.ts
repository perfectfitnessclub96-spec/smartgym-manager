import { useState, useCallback } from 'react';
import { z } from 'zod';

export function useFormValidation<T extends z.ZodSchema>(schema: T) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback((data: unknown): data is z.infer<T> => {
    setIsValidating(true);
    try {
      schema.parse(data);
      setErrors({});
      setIsValidating(false);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      setIsValidating(false);
      return false;
    }
  }, [schema]);

  const validateField = useCallback((field: string, value: unknown) => {
    try {
      const partialSchema = z.object({ [field]: schema.shape[field] });
      partialSchema.parse({ [field]: value });
      setErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors[0]?.message || `Invalid ${field}`;
        setErrors(prev => ({ ...prev, [field]: message }));
      }
      return false;
    }
  }, [schema]);

  const clearErrors = useCallback(() => setErrors({}), []);
  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  return { errors, isValidating, validate, validateField, clearErrors, clearFieldError };
}

// Predefined schemas for common forms
export const memberFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  mobileNumber: z.string().regex(/^[0-9]{10}$/, 'Invalid mobile number (10 digits required)'),
  planId: z.string().min(1, 'Please select a plan'),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

export const loginFormSchema = z.object({
  loginId: z.string().min(3, 'Login ID must be at least 3 characters'),
  password: z.string().min(1, 'Password is required'),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 
      'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const bookingFormSchema = z.object({
  serviceId: z.string().min(1, 'Please select a service'),
  bookingDate: z.string().min(1, 'Please select a date'),
  startTime: z.string().min(1, 'Please select a time'),
});