
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface AchievementBadgeProps {
  tier: AchievementTier;
  icon: LucideIcon;
  title: string;
  description?: string;
  isUnlocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  tier,
  icon: Icon,
  title,
  description,
  isUnlocked = false,
  size = 'md',
  className,
  onClick
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-20 h-20 text-base'
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const tierClasses = {
    bronze: 'game-achievement-bronze',
    silver: 'game-achievement-silver', 
    gold: 'game-achievement-gold',
    platinum: 'game-achievement-platinum'
  };

  return (
    <div 
      className={cn(
        "relative group cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className={cn(
        "rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-all duration-300 game-interactive-hover",
        sizeClasses[size],
        isUnlocked ? tierClasses[tier] : "bg-gray-300 grayscale",
        isUnlocked && "hover:shadow-xl"
      )}>
        <Icon className={cn(
          iconSizes[size],
          isUnlocked ? "text-white" : "text-gray-500"
        )} />
      </div>
      
      {isUnlocked && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      )}
      
      {(title || description) && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap max-w-48">
            <div className="font-semibold">{title}</div>
            {description && <div className="text-gray-300">{description}</div>}
          </div>
        </div>
      )}
    </div>
  );
};
