// India-specific price formatting helpers.

// Full amount with Indian digit grouping, e.g. 1234567 -> "₹12,34,567"
export function formatINR(amount) {
  const num = Number(amount) || 0;
  return `\u20B9${num.toLocaleString("en-IN")}`;
}

// Compact form for cards, e.g. 12500000 -> "₹1.25 Cr", 250000 -> "₹2.5 L"
export function formatINRShort(amount) {
  const num = Number(amount) || 0;

  if (num >= 10000000) {
    const value = num / 10000000;
    return `\u20B9${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    const value = num / 100000;
    return `\u20B9${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)} L`;
  }
  return `\u20B9${num.toLocaleString("en-IN")}`;
}
