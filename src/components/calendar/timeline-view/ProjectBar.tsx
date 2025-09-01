
import React from 'react';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface Project {
  name: string;
  startDate: string;
  endDate: string | null;
  engagementPercentage: number;
}

interface ProjectBarProps {
  project: Project;
  month: Date;
  index: number;
  colorCode: string;
}

export const ProjectBar: React.FC<ProjectBarProps> = ({ project, month, index, colorCode }) => {
  // Helper function to calculate project bar position and width for a month
  const getProjectBarStyle = (project: Project, month: Date) => {
    if (!project.startDate) return null;
    
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const projectStart = new Date(project.startDate);
    const projectEnd = project.endDate ? new Date(project.endDate) : new Date('2099-12-31');
    
    // Check if project overlaps with this month
    const overlaps = isWithinInterval(monthStart, { start: projectStart, end: projectEnd }) ||
                    isWithinInterval(monthEnd, { start: projectStart, end: projectEnd }) ||
                    isWithinInterval(projectStart, { start: monthStart, end: monthEnd }) ||
                    isWithinInterval(projectEnd, { start: monthStart, end: monthEnd });
    
    if (!overlaps) return null;
    
    // Calculate start and end positions within the month (0-100%)
    const startPos = projectStart <= monthStart ? 0 : 
      ((projectStart.getTime() - monthStart.getTime()) / (monthEnd.getTime() - monthStart.getTime())) * 100;
    
    const endPos = projectEnd >= monthEnd ? 100 :
      ((projectEnd.getTime() - monthStart.getTime()) / (monthEnd.getTime() - monthStart.getTime())) * 100;
    
    const width = endPos - startPos;
    
    return {
      left: `${startPos}%`,
      width: `${width}%`,
    };
  };



  const barStyle = getProjectBarStyle(project, month);
  if (!barStyle) return null;

  return (
    <div
      className="absolute rounded text-xs text-white flex items-center justify-center overflow-hidden shadow-sm"
      style={{
        ...barStyle,
        backgroundColor: colorCode,
        top: `${index * 30}px`,
        height: '24px',
        fontSize: '10px',
        fontWeight: '500'
      }}
      title={`${project.name} (${project.engagementPercentage}%)`}
    >
      <span className="truncate px-2">{project.name}</span>
    </div>
  );
};
