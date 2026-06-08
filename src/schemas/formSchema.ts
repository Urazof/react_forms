import { z } from 'zod';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 МБ
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

export function createFormSchema(countries: string[]) {
  return z
    .object({
      name: z
        .string()
        .min(1, 'Имя обязательно')
        .refine(
          (v) =>
            v.length > 0 &&
            v[0].toUpperCase() === v[0] &&
            v[0].toLowerCase() !== v[0],
          'Первая буква должна быть заглавной'
        ),

      age: z.coerce
        .number()
        .int('Возраст должен быть целым числом')
        .nonnegative('Возраст не может быть отрицательным'),

      email: z.string().refine((v) => {
        const parts = v.split('@');
        if (parts.length !== 2) return false;
        const [local, domain] = parts;
        return local.length > 0 && domain.length > 0 && domain.includes('.');
      }, 'Некорректный email (ожидается: user@example.com)'),

      password: z.string().min(1, 'Введите пароль'),

      confirmPassword: z.string().min(1, 'Подтвердите пароль'),

      gender: z.enum(['male', 'female', 'other'], {
        message: 'Выберите пол',
      }),

      terms: z
        .boolean()
        .refine((v) => v === true, 'Необходимо принять условия использования'),

      country: z
        .string()
        .min(1, 'Выберите страну')
        .refine((v) => countries.includes(v), 'Страна не найдена в списке'),

      image: z
        .instanceof(File, { message: 'Загрузите изображение' })
        .refine(
          (f) => ALLOWED_TYPES.includes(f.type),
          'Допустимы только PNG и JPEG'
        )
        .refine(
          (f) => f.size <= MAX_FILE_SIZE,
          'Файл не должен превышать 2 МБ'
        ),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: 'Пароли не совпадают',
      path: ['confirmPassword'],
    });
}

export type FormValues = z.infer<ReturnType<typeof createFormSchema>>;
