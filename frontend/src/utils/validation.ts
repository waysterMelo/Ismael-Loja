export function validateRequired(value: string | undefined | null, label: string): string | null {
  if (!value || value.trim().length === 0) return `${label} é obrigatório`;
  return null;
}

export function validateEmail(value: string | undefined | null): string | null {
  if (!value || value.trim().length === 0) return null;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(value)) return 'Email inválido';
  return null;
}

export function validateCPF(value: string | undefined | null): string | null {
  if (!value || value.trim().length === 0) return null;
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11) return 'CPF deve ter 11 dígitos';
  return null;
}

export function validatePhone(value: string | undefined | null): string | null {
  if (!value || value.trim().length === 0) return null;
  const digits = value.replace(/\D/g, '');
  if (digits.length < 10) return 'Telefone deve ter pelo menos 10 dígitos';
  return null;
}

export type ValidationErrors = Record<string, string>;

export function clearValidation(): ValidationErrors {
  return {};
}
