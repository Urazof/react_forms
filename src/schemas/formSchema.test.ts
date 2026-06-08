import { describe, it, expect } from 'vitest';
import { createFormSchema } from './formSchema';

const countries = ['Россия', 'Германия', 'США'];
const schema = createFormSchema(countries);

const validImage = new File(['img'], 'photo.png', { type: 'image/png' });

const valid = {
  name: 'Иван',
  age: 25,
  email: 'ivan@example.com',
  password: 'Pass1!',
  confirmPassword: 'Pass1!',
  gender: 'male' as const,
  terms: true,
  country: 'Россия',
  image: validImage,
};

describe('createFormSchema', () => {
  it('accepts valid data', () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  // --- name ---
  it('rejects empty name', () => {
    expect(schema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('rejects name with lowercase first letter', () => {
    const r = schema.safeParse({ ...valid, name: 'иван' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toMatch(/заглавной/i);
    }
  });

  it('accepts name starting with uppercase', () => {
    expect(schema.safeParse({ ...valid, name: 'Иван' }).success).toBe(true);
  });

  // --- age ---
  it('rejects negative age', () => {
    expect(schema.safeParse({ ...valid, age: -1 }).success).toBe(false);
  });

  it('rejects non-integer age', () => {
    expect(schema.safeParse({ ...valid, age: 25.5 }).success).toBe(false);
  });

  it('accepts age of 0', () => {
    expect(schema.safeParse({ ...valid, age: 0 }).success).toBe(true);
  });

  // --- email ---
  it('rejects email without @', () => {
    expect(schema.safeParse({ ...valid, email: 'notanemail' }).success).toBe(false);
  });

  it('rejects email without domain dot', () => {
    expect(schema.safeParse({ ...valid, email: 'a@b' }).success).toBe(false);
  });

  it('rejects email with empty local part', () => {
    expect(schema.safeParse({ ...valid, email: '@example.com' }).success).toBe(false);
  });

  it('accepts valid email', () => {
    expect(schema.safeParse({ ...valid, email: 'user@example.com' }).success).toBe(true);
  });

  // --- password ---
  it('rejects mismatched passwords', () => {
    const r = schema.safeParse({ ...valid, confirmPassword: 'Different1!' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const err = r.error.issues.find((i) => i.path[0] === 'confirmPassword');
      expect(err).toBeTruthy();
    }
  });

  // --- gender ---
  it('rejects invalid gender value', () => {
    expect(schema.safeParse({ ...valid, gender: 'unknown' }).success).toBe(false);
  });

  // --- terms ---
  it('rejects terms: false', () => {
    expect(schema.safeParse({ ...valid, terms: false }).success).toBe(false);
  });

  // --- country ---
  it('rejects country not in the list', () => {
    expect(schema.safeParse({ ...valid, country: 'Антарктида' }).success).toBe(false);
  });

  it('rejects empty country', () => {
    expect(schema.safeParse({ ...valid, country: '' }).success).toBe(false);
  });

  // --- image ---
  it('rejects image with wrong MIME type', () => {
    const pdf = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
    expect(schema.safeParse({ ...valid, image: pdf }).success).toBe(false);
  });

  it('rejects image exceeding 2 MB', () => {
    const big = new File([new ArrayBuffer(3 * 1024 * 1024)], 'big.png', {
      type: 'image/png',
    });
    expect(schema.safeParse({ ...valid, image: big }).success).toBe(false);
  });

  it('rejects empty file (size = 0)', () => {
    const empty = new File([], 'empty.png', { type: 'image/png' });
    expect(schema.safeParse({ ...valid, image: empty }).success).toBe(false);
  });

  it('accepts jpeg image', () => {
    const jpeg = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
    expect(schema.safeParse({ ...valid, image: jpeg }).success).toBe(true);
  });
});
