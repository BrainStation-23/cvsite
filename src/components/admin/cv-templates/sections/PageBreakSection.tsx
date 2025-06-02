
import React from 'react';

interface PageBreakSectionProps {
  // No props needed - page break is purely functional
}

export const PageBreakSection: React.FC<PageBreakSectionProps> = () => {
  // Page breaks are now handled by the IntelligentPageDistributor
  // This component should not render anything visible in the CV preview
  // as the page break logic is handled at the distributor level
  return null;
};
