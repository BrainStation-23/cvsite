
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
        "w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ml-1",
        "animate-pulse relative",
        "hover:scale-110 transition-transform duration-200",
        className
      )}
      style={{
        boxShadow: '0 0 6px rgba(251, 146, 60, 0.4), 0 2px 3px rgba(0, 0, 0, 0.1)',
        animationDuration: '3s', // Slower pulse
      }}
    >
      <span className="relative z-10 leading-none text-[10px]">!</span>
      {/* Ping effect using pseudo-element */}
      <div 
        className="absolute inset-0 rounded-full bg-orange-400 opacity-30 animate-ping"
        style={{
          animationDuration: '4s',
        }}
      />
    </div>
  );
};
