export function formatPublicPrice(price: string, currency: string, locale = "uk-UA"): string {
  const amount = Number(price);

  if (Number.isNaN(amount)) {
    return `${price} ${currency}`;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
