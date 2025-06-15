
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Trophy, Star } from 'lucide-react';

interface ProfileCompletionProgressProps {
  completionPercentage: number;
  className?: string;
  showDetails?: boolean;
}

export const ProfileCompletionProgress: React.FC<ProfileCompletionProgressProps> = ({
  completionPercentage,
  className,
  showDetails = true
}) => {
  const getCompletionLevel = (percentage: number) => {
    if (percentage >= 100) return { level: 'Master', color: 'text-game-achievement-gold', icon: Trophy };
    if (percentage >= 80) return { level: 'Expert', color: 'text-game-achievement-silver', icon: Star };
    if (percentage >= 60) return { level: 'Advanced', color: 'text-game-achievement-bronze', icon: Star };
    if (percentage >= 40) return { level: 'Intermediate', color: 'text-blue-500', icon: Star };
    return { level: 'Beginner', color: 'text-gray-500', icon: Star };
  };

  const levelInfo = getCompletionLevel(completionPercentage);
  const LevelIcon = levelInfo.icon;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LevelIcon className={cn("h-5 w-5", levelInfo.color)} />
          <span className="font-semibold text-sm">Profile Completion</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-bold", levelInfo.color)}>
            {levelInfo.level}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(completionPercentage)}%
          </span>
        </div>
      </div>
      
      <Progress 
        value={completionPercentage} 
        className="h-3 game-interactive-hover"
        style={{ 
          background: 'hsl(var(--game-progress-bg))',
        }}
      />
      
      {showDetails && completionPercentage < 100 && (
        <div className="text-xs text-muted-foreground">
          Complete your profile to unlock achievements and improve visibility!
        </div>
      )}
    </div>
  );
};
