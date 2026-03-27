// Convert KES to cents (store in DB as integer)
export function convertToCents(amount: number) {
  return Math.round(amount * 100);
}

// Convert cents back to KES (for display/use)
export function convertCentsToKes(amount: number) {
  return amount / 100;
}

// Format currency in Kenyan Shillings
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
}
