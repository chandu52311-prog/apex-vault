export const FINANCE_CONFIG = {
  annualInterestRate: 0.085, // 8.5% annual interest
  defaultTenureYears: 5,     // 60 months (5 years)
  defaultDownPaymentPercent: 0.20, // 20% down payment
};

// EMI Calculator Function
export function calculateMonthlyEMI(totalPrice: number): number {
  if (!totalPrice || totalPrice <= 0) return 0;
  const principal = totalPrice * (1 - FINANCE_CONFIG.defaultDownPaymentPercent);
  const monthlyRate = FINANCE_CONFIG.annualInterestRate / 12;
  const months = FINANCE_CONFIG.defaultTenureYears * 12;
  
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
              (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(emi);
}
