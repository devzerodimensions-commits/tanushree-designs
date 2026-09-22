export const percentagePoints = (value) => Math.round((Number(value) || 0) * 100);

export function usageTotal(items = []) {
  return items.reduce((total, item) => total + percentagePoints(item?.usage_percent), 0);
}

export function usageError(items) {
  if (!Array.isArray(items)) return 'Products must be a list.';
  if (!items.length) return null;
  for (const item of items) {
    if (!item || typeof item !== 'object' || !String(item.name ?? '').trim()) {
      return 'Enter a name for every product or remove the empty row.';
    }
    const value = Number(item.usage_percent);
    if (!Number.isFinite(value) || value < 0 || value > 100 ||
        Math.abs(value * 100 - Math.round(value * 100)) > 0.000001) {
      return 'Each usage percentage must be between 0 and 100, with up to two decimal places.';
    }
  }
  const total = usageTotal(items);
  return total === 10000 ? null : `Product usage must total 100%. Current total: ${total / 100}%.`;
}
