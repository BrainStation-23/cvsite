
import React from 'react';
import { cn } from '@/lib/utils';

interface GameNotificationBadgeProps {
  className?: string;
}

export const GameNotificationBadge: React.FC<GameNotificationBadgeProps> = ({ 
  className 
}) => {
  return (
    <div
      className={cn(
        "absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg z-10",
        "animate-pulse",
        "before:absolute before:inset-0 before:rounded-full before:bg-orange-400 before:opacity-50 before:animate-ping",
        "hover:scale-110 transition-transform duration-200",
        className
      )}
      style={{
        boxShadow: '0 0 8px rgba(251, 146, 60, 0.6), 0 2px 4px rgba(0, 0, 0, 0.2)',
      }}
    >
      <span className="relative z-10 leading-none">!</span>
    </div>
  );
};
