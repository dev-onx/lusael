export function calcMonthlyPayment(
  priceQar: number,
  downPaymentPct: number,
  annualRatePct = 4.5,
  termYears = 25
): number {
  const principal = priceQar * (1 - downPaymentPct / 100);
  const monthlyRate = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (monthlyRate === 0) return Math.round(principal / n);
  const payment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
    (Math.pow(1 + monthlyRate, n) - 1);
  return Math.round(payment);
}

export function formatQar(amount: number): string {
  if (amount >= 1_000_000) {
    return `QAR ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `QAR ${(amount / 1_000).toFixed(0)}K`;
  }
  return `QAR ${amount.toLocaleString()}`;
}
