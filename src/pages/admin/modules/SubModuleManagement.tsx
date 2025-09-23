import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { useModule, useSubModules } from '@/hooks/rbac/useModules';
import { SubModulesList } from '@/components/admin/modules/SubModulesList';

const SubModuleManagement: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: module, isLoading: moduleLoading } = useModule(moduleId!);
  const { data: subModules, isLoading: subModulesLoading } = useSubModules(moduleId, true);

  const filteredSubModules = subModules?.filter(subModule =>
    subModule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subModule.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (moduleLoading || subModulesLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!module) {
    return <div className="text-destructive">Module not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/modules">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Modules
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{module.name} - Sub-modules</h1>
          <p className="text-muted-foreground">
            Manage sub-modules for the {module.name} module
          </p>
        </div>
        <Button asChild className="ml-auto">
          <Link to={`/admin/modules/${moduleId}/submodules/create`}>
            <Plus className="w-4 h-4 mr-2" />
            Create Sub-module
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sub-modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <SubModulesList 
        subModules={filteredSubModules || []} 
        moduleId={moduleId!}
      />
    </div>
  );
};

export default SubModuleManagement;