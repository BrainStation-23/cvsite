import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ModuleService } from '@/services/rbac/moduleService';
import { Module, SubModule } from '@/types';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/error-utils';

export const useModules = (includeInactive = false) => {
  return useQuery({
    queryKey: ['modules', includeInactive],
    queryFn: () => ModuleService.getAllModules(includeInactive),
  });
};

export const useModule = (id: string) => {
  return useQuery({
    queryKey: ['module', id],
    queryFn: () => ModuleService.getModuleById(id),
    enabled: !!id,
  });
};

export const useSubModules = (moduleId?: string, includeInactive = false) => {
  return useQuery({
    queryKey: ['subModules', moduleId, includeInactive],
    queryFn: () => ModuleService.getSubModules(moduleId, includeInactive),
  });
};

export const useSubModule = (id: string) => {
  return useQuery({
    queryKey: ['subModule', id],
    queryFn: () => ModuleService.getSubModuleById(id),
    enabled: !!id,
  });
};

export const useModulesWithSubModules = (includeInactive = false) => {
  return useQuery({
    queryKey: ['modulesWithSubModules', includeInactive],
    queryFn: () => ModuleService.getModulesWithSubModules(includeInactive),
  });
};

export const useAvailableTables = () => {
  return useQuery({
    queryKey: ['availableTables'],
    queryFn: ModuleService.getAvailableTables,
  });
};

export const useSBUs = () => {
  return useQuery({
    queryKey: ['sbus'],
    queryFn: ModuleService.getAllSBUs,
  });
};

// Module mutations
export const useCreateModule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (moduleData: Omit<Module, 'id' | 'created_at' | 'updated_at'>) => 
      ModuleService.createModule(moduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['modulesWithSubModules'] });
      toast.success('Module created successfully');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error) || 'Failed to create module';
      toast.error(message);
    },
  });
};

export const useUpdateModule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Module> }) => 
      ModuleService.updateModule(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['modulesWithSubModules'] });
      toast.success('Module updated successfully');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error) || 'Failed to update module';
      toast.error(message);
    },
  });
};

export const useDeleteModule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ModuleService.deleteModule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['modulesWithSubModules'] });
      toast.success('Module deleted successfully');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error) || 'Failed to delete module';
      toast.error(message);
    },
  });
};

// SubModule mutations
export const useCreateSubModule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (subModuleData: Omit<SubModule, 'id' | 'created_at' | 'updated_at'>) => 
      ModuleService.createSubModule(subModuleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subModules'] });
      queryClient.invalidateQueries({ queryKey: ['modulesWithSubModules'] });
      toast.success('Sub-module created successfully');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error) || 'Failed to create sub-module';
      toast.error(message);
    },
  });
};

export const useUpdateSubModule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SubModule> }) => 
      ModuleService.updateSubModule(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subModules'] });
      queryClient.invalidateQueries({ queryKey: ['modulesWithSubModules'] });
      toast.success('Sub-module updated successfully');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error) || 'Failed to update sub-module';
      toast.error(message);
    },
  });
};

export const useDeleteSubModule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ModuleService.deleteSubModule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subModules'] });
      queryClient.invalidateQueries({ queryKey: ['modulesWithSubModules'] });
      toast.success('Sub-module deleted successfully');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error) || 'Failed to delete sub-module';
      toast.error(message);
    },
  });
};