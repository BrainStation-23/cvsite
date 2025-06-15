
import React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Zap } from 'lucide-react';

interface XPLevelDisplayProps {
  currentXP: number;
  currentLevel: number;
  xpForNextLevel: number;
  xpToNextLevel: number;
  className?: string;
  showDetails?: boolean;
}

export const XPLevelDisplay: React.FC<XPLevelDisplayProps> = ({
  currentXP,
  currentLevel,
  xpForNextLevel,
  xpToNextLevel,
  className,
  showDetails = true
}) => {
  const progressPercentage = ((xpForNextLevel - xpToNextLevel) / xpForNextLevel) * 100;
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="game-level-badge flex items-center gap-1 px-3 py-1">
            <Zap className="h-4 w-4" />
            <span className="font-bold">Level {currentLevel}</span>
          </div>
        </div>
        
        {showDetails && (
          <div className="text-sm text-muted-foreground">
            {currentXP.toLocaleString()} XP
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Progress 
          value={progressPercentage} 
          className="h-2 game-interactive-hover game-xp-gradient"
        />
        
        {showDetails && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{(xpForNextLevel - xpToNextLevel).toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</span>
            <span>{xpToNextLevel.toLocaleString()} XP to next level</span>
          </div>
        )}
      </div>
    </div>
  );
};
