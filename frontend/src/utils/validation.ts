export type ValidationErrors = Record<string, string>;

export function validateRequired(value: string | undefined | null, label: string = 'Campo'): string | null {
  if (!value || String(value).trim().length === 0) return `${label} é obrigatório`;
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
  
  // Validar dígitos verificadores do CPF
  if (isInvalidCPF(digits)) return 'CPF inválido';
  return null;
}

function isInvalidCPF(cpf: string): boolean {
  if (cpf.length !== 11) return true;
  
  // Eliminar CPFs com todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cpf)) return true;
  
  // Validar primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return true;
  
  // Validar segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return true;
  
  return false;
}

export function validatePhone(value: string | undefined | null): string | null {
  if (!value || value.trim().length === 0) return null;
  const digits = value.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 11) return 'Telefone deve ter 10 ou 11 dígitos';
  return null;
}

export function validatePassword(value: string | undefined | null): string | null {
  if (!value || value.length === 0) return null;
  if (value.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
  return null;
}

export function validateMinLength(value: string | undefined | null, min: number, label: string = 'Campo'): string | null {
  if (!value || value.length === 0) return null;
  if (value.length < min) return `${label} deve ter pelo menos ${min} caracteres`;
  return null;
}

export function validateMaxLength(value: string | undefined | null, max: number, label: string = 'Campo'): string | null {
  if (!value || value.length === 0) return null;
  if (value.length > max) return `${label} deve ter no máximo ${max} caracteres`;
  return null;
}

export function validateNumber(value: number | undefined | null, min: number = 0, label: string = 'Valor'): string | null {
  if (value === null || value === undefined) return null;
  if (value < min) return `${label} deve ser maior ou igual a ${min}`;
  return null;
}

export function runValidations(validations: Array<() => string | null>): ValidationErrors {
  const errors: ValidationErrors = {};
  
  for (const validate of validations) {
    const result = validate();
    if (result) {
      // Usar a primeira mensagem como erro genérico se não houver chave
      errors._generic = result;
      break;
    }
  }
  
  return errors;
}
