import { useQuery } from '@tanstack/react-query';
import { ModuleService } from '@/services/rbac/moduleService';

export const useModules = () => {
  return useQuery({
    queryKey: ['modules'],
    queryFn: ModuleService.getAllModules,
  });
};

export const useSubModules = (moduleId?: string) => {
  return useQuery({
    queryKey: ['subModules', moduleId],
    queryFn: () => ModuleService.getSubModules(moduleId),
  });
};

export const useModulesWithSubModules = () => {
  return useQuery({
    queryKey: ['modulesWithSubModules'],
    queryFn: ModuleService.getModulesWithSubModules,
  });
};

export const useSBUs = () => {
  return useQuery({
    queryKey: ['sbus'],
    queryFn: ModuleService.getAllSBUs,
  });
};