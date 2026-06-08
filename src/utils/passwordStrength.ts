export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

export const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  0: 'Очень слабый',
  1: 'Слабый',
  2: 'Средний',
  3: 'Хороший',
  4: 'Сильный',
};

export const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  0: '#e53e3e',
  1: '#dd6b20',
  2: '#d69e2e',
  3: '#38a169',
  4: '#2b6cb0',
};

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 0;
  let score = 0;
  if (/[0-9]/.test(password)) score++;
  if (/[A-ZА-ЯЁ]/.test(password)) score++;
  if (/[a-zа-яё]/.test(password)) score++;
  if (/[^A-Za-zА-ЯЁа-яё0-9]/.test(password)) score++;
  return score as PasswordStrength;
}
