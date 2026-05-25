export function formatCurrency(amount: number): string {
  return `Rp ${(amount / 100).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
