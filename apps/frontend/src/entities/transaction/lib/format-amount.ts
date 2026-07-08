const numberFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export function formatAmount(value: number): string {
  return numberFormat.format(value);
}
