import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search } from 'lucide-react';
import { useModulesWithSubModules } from '@/hooks/rbac/useModules';
import { ModulesList } from '@/components/admin/modules/ModulesList';
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
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Module Management</h1>
          <p className="text-muted-foreground">
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

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchy View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <ModulesList modules={filteredModules || []} />
        </TabsContent>

        <TabsContent value="hierarchy" className="mt-6">
          <ModuleHierarchyTree modules={filteredModules || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModuleManagement;