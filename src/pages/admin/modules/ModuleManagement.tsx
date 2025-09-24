import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Settings } from 'lucide-react';
import { useModulesWithSubModules } from '@/hooks/rbac/useModules';
import { ModuleHierarchyTree } from '@/components/admin/modules/ModuleHierarchyTree';

const ModuleManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: modules, isLoading, error } = useModulesWithSubModules(true);

  const filteredModules = modules?.filter(module =>
    module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading modules...</div>;
  }

  if (error) {
    return <div className="text-destructive">Error loading modules: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Module Management</h1>
          <p className="text-muted-foreground mt-1">
            Configure system modules and sub-modules for dynamic navigation and permissions
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/modules/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Module
          </Link>
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules and sub-modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>{modules?.length || 0} modules</span>
          </div>
          <div className="text-muted-foreground">•</div>
          <div>
            {modules?.reduce((total, module) => total + (module.sub_modules?.length || 0), 0) || 0} sub-modules
          </div>
        </div>
      </div>

      {/* Module Hierarchy */}
      <ModuleHierarchyTree modules={filteredModules || []} />
    </div>
  );
};

export default ModuleManagement;