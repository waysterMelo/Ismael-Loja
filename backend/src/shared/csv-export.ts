/**
 * Utilitário para exportação de dados em CSV
 */

export function toCSV(data: Record<string, unknown>[], headers: string[], labels?: Record<string, string>): string {
  const headerRow = headers.map(h => labels?.[h] || h).join(',');
  
  const rows = data.map(row => {
    return headers.map(h => {
      const value = row[h];
      // Escapar valores com vírgulas ou aspas
      if (value === null || value === undefined) {
        return '';
      }
      const strValue = String(value);
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    }).join(',');
  });

  return [headerRow, ...rows].join('\n');
}

export function downloadCSV(csvContent: string, filename: string): void {
  // Implementação será no frontend
  // Esta função é apenas um placeholder para o backend
}

export function formatCurrencyBRL(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

export function formatDateBR(date: Date | string): string {
  const dateValue = typeof date === 'string' ? new Date(date) : date;
  return dateValue.toLocaleDateString('pt-BR');
}
