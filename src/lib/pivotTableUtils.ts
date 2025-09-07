export const getDimensionLabel = (dimension: string) => {
  const labels: Record<string, string> = {
    'sbu': 'SBU',
    'resource_type': 'Resource Type',
    'bill_type': 'Bill Type',
    'expertise': 'Expertise Type',
  };
  return labels[dimension] || dimension.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getIntensityClass = (value: number, maxValue: number) => {
  if (value === 0) return 'bg-background';
  const intensity = value / maxValue;
  if (intensity > 0.7) return 'bg-primary/20 text-primary';
  if (intensity > 0.4) return 'bg-primary/10 text-primary';
  if (intensity > 0.2) return 'bg-primary/5';
  return 'bg-background';
};