import { describe, it, expect, vi, afterEach } from 'vitest';
import { imageToBase64 } from './imageToBase64';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('imageToBase64', () => {
  it('resolves with the data URL from FileReader', async () => {
    const expected = 'data:image/png;base64,dGVzdA==';

    class MockFileReader {
      result: string | null = expected;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      readAsDataURL(_file: File) {
        Promise.resolve().then(() => this.onload?.());
      }
    }

    vi.stubGlobal('FileReader', MockFileReader);

    const file = new File(['test'], 'photo.png', { type: 'image/png' });
    await expect(imageToBase64(file)).resolves.toBe(expected);
  });

  it('rejects with an error when FileReader fails', async () => {
    class MockFileReader {
      result: string | null = null;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      readAsDataURL(_file: File) {
        Promise.resolve().then(() => this.onerror?.());
      }
    }

    vi.stubGlobal('FileReader', MockFileReader);

    const file = new File([''], 'fail.png', { type: 'image/png' });
    await expect(imageToBase64(file)).rejects.toThrow('Не удалось прочитать файл');
  });
});
