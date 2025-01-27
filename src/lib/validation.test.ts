import { validateUrl, validateText, validateAmount } from './validation';

describe('validateUrl', () => {
  test('正しいURLの場合はtrueを返す', () => {
    expect(validateUrl('https://example.com')).toBe(true);
    expect(validateUrl('http://localhost:3000')).toBe(true);
  });

  test('不正なURLの場合はfalseを返す', () => {
    expect(validateUrl('not-a-url')).toBe(false);
    expect(validateUrl('')).toBe(false);
    expect(validateUrl(null)).toBe(false);
    expect(validateUrl(undefined)).toBe(false);
  });
});

describe('validateText', () => {
  test('デフォルトオプションでの正常なテキスト', () => {
    const result = validateText('正常なテキスト', 'テスト');
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });

  test('必須フィールドが空の場合', () => {
    const result = validateText('', 'テスト');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('テストは必須です');
  });

  test('最大長を超える場合', () => {
    const longText = 'a'.repeat(1001);
    const result = validateText(longText, 'テスト');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('テストは1000文字以下で入力してください');
  });

  test('カスタムオプションでの検証', () => {
    const result = validateText('短すぎ', 'テスト', { minLength: 10 });
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('テストは10文字以上で入力してください');
  });

  test('必須でないフィールドが空の場合', () => {
    const result = validateText('', 'テスト', { required: false });
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });
});

describe('validateAmount', () => {
  test('有効な金額の場合はtrueを返す', () => {
    expect(validateAmount(100)).toBe(true);
    expect(validateAmount(5000)).toBe(true);
    expect(validateAmount(10000000)).toBe(true);
  });

  test('無効な金額の場合はfalseを返す', () => {
    expect(validateAmount(99)).toBe(false);
    expect(validateAmount(10000001)).toBe(false);
    expect(validateAmount(0)).toBe(false);
    expect(validateAmount(-1)).toBe(false);
    expect(validateAmount(null)).toBe(false);
    expect(validateAmount(undefined)).toBe(false);
  });
}); 