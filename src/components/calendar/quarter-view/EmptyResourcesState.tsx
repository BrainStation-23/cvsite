
import React from 'react';
import { Users } from 'lucide-react';

export const EmptyResourcesState: React.FC = () => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>No resources found for this quarter</p>
    </div>
  );
};
