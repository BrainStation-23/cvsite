
import React from 'react';
import { Users } from 'lucide-react';

export const EmptyResourcesState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-muted-foreground mb-2">No resources found</h3>
      <p className="text-sm text-muted-foreground">
        Try adjusting your filters or search criteria to see resource allocations.
      </p>
    </div>
  );
};
