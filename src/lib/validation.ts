export function validateUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

interface ValidationOptions {
  maxLength?: number;
  minLength?: number;
  required?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
}

export function validateText(
  value: string | undefined | null,
  fieldName: string,
  options: ValidationOptions = {}
): ValidationResult {
  const {
    maxLength = 1000,
    minLength = 1,
    required = true,
  } = options;

  if (!value) {
    if (required) {
      return {
        isValid: false,
        message: `${fieldName}は必須です`,
      };
    }
    return { isValid: true, message: '' };
  }

  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    return {
      isValid: false,
      message: `${fieldName}は${minLength}文字以上で入力してください`,
    };
  }

  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      message: `${fieldName}は${maxLength}文字以下で入力してください`,
    };
  }

  return { isValid: true, message: '' };
}

export function validateAmount(amount: number | null | undefined): boolean {
  if (typeof amount !== 'number') return false;
  return amount >= 100 && amount <= 10000000; // 100円から1000万円まで
} 