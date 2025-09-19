export const getNonBilledDimensionLabel = (dimension: string) => {
  const labels: Record<string, string> = {
    'sbu': 'SBU',
    'expertise': 'Expertise',
    'bill_type': 'Bill Type',
  };
  return labels[dimension] || dimension.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getNonBilledIntensityClass = (value: number, maxValue: number) => {
  if (value === 0) return 'bg-background';
  const intensity = value / maxValue;
  if (intensity > 0.7) return 'bg-destructive/20 text-destructive';
  if (intensity > 0.4) return 'bg-destructive/10 text-destructive';
  if (intensity > 0.2) return 'bg-destructive/5';
  return 'bg-background';
};

export const getNonBilledDescription = (benchFilter: boolean | null, primaryDim: string, secondaryDim: string) => {
  const prefix = benchFilter === true 
    ? 'Bench resources' 
    : benchFilter === false 
      ? 'Non-bench resources' 
      : 'All non-billed resources';
  
  return `${prefix} analyzed by ${getNonBilledDimensionLabel(primaryDim)} and ${getNonBilledDimensionLabel(secondaryDim)}`;
};