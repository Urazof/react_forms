import { describe, it, expect } from 'vitest';
import {
  getPasswordStrength,
  STRENGTH_LABELS,
  STRENGTH_COLORS,
} from './passwordStrength';

describe('getPasswordStrength', () => {
  it('returns 0 for empty string', () => {
    expect(getPasswordStrength('')).toBe(0);
  });

  it('returns 1 for digits only', () => {
    expect(getPasswordStrength('12345678')).toBe(1);
  });

  it('returns 2 for digits + uppercase', () => {
    expect(getPasswordStrength('12345A')).toBe(2);
  });

  it('returns 3 for digits + uppercase + lowercase', () => {
    expect(getPasswordStrength('12Abc')).toBe(3);
  });

  it('returns 4 for all character categories', () => {
    expect(getPasswordStrength('Abc1!')).toBe(4);
  });

  it('returns 1 for lowercase letters only', () => {
    expect(getPasswordStrength('abcdef')).toBe(1);
  });

  it('returns 1 for special characters only', () => {
    expect(getPasswordStrength('!!!')).toBe(1);
  });

  it('returns 2 for uppercase + lowercase', () => {
    expect(getPasswordStrength('AbCd')).toBe(2);
  });

  it('returns 3 for uppercase + lowercase + special', () => {
    expect(getPasswordStrength('Ab!')).toBe(3);
  });

  it('STRENGTH_LABELS has entry for each score 0-4', () => {
    ([0, 1, 2, 3, 4] as const).forEach((score) => {
      expect(STRENGTH_LABELS[score]).toBeTruthy();
    });
  });

  it('STRENGTH_COLORS has entry for each score 0-4', () => {
    ([0, 1, 2, 3, 4] as const).forEach((score) => {
      expect(STRENGTH_COLORS[score]).toMatch(/^#/);
    });
  });
});
