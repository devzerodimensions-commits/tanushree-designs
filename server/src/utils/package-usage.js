/** Normalize product usage, including older plain-text features. */
export function normaliseFeatures(features) {
  if (!Array.isArray(features)) return [];
  return features
    .map((f) =>
      typeof f === 'string'
        ? { name: f, qty: 0, unit: 'nos', usage_percent: 0 }
        : {
            name: String(f?.name ?? '').trim(),
            usage_percent: Math.min(100, Math.max(0, Number(f?.usage_percent) || 0)),
            // How much of it one running foot takes, if the studio said.
            qty: Math.max(0, Number(f?.qty) || 0),
            unit: String(f?.unit || 'nos'),
          }
    )
    .filter((f) => f.name);
}

/** Product quantities never affect the package rate. */
export function packageRate(pkg) {
  return Math.max(0, Number(pkg?.rate_per_ft) || 0);
}

export function includedUsage(features, runningFeet) {
  return normaliseFeatures(features).map((f) => ({
    name: f.name,
    usage_percent: f.usage_percent,
    quantity: f.qty > 0 ? Math.round(runningFeet * f.qty * 100) / 100 : null,
    unit: f.unit,
  }));
}
