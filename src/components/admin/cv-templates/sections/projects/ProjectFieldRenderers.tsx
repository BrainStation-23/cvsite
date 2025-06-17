
import { ProjectNameRenderer } from './renderers/ProjectNameRenderer';
import { ProjectRoleRenderer } from './renderers/ProjectRoleRenderer';
import { 
  ProjectStartDateRenderer, 
  ProjectEndDateRenderer, 
  ProjectDateRangeRenderer 
} from './renderers/ProjectDateRenderer';
import { ProjectDescriptionRenderer } from './renderers/ProjectDescriptionRenderer';
import { ProjectResponsibilityRenderer } from './renderers/ProjectResponsibilityRenderer';
import { ProjectTechnologiesRenderer } from './renderers/ProjectTechnologiesRenderer';
import { ProjectUrlRenderer } from './renderers/ProjectUrlRenderer';

export const ProjectFieldRenderers = {
  name: ProjectNameRenderer,
  role: ProjectRoleRenderer,
  start_date: ProjectStartDateRenderer,
  end_date: ProjectEndDateRenderer,
  date_range: ProjectDateRangeRenderer,
  description: ProjectDescriptionRenderer,
  responsibility: ProjectResponsibilityRenderer,
  technologies_used: ProjectTechnologiesRenderer,
  url: ProjectUrlRenderer
};
