
import React from 'react';
import { cn } from '@/lib/utils';

interface GameNotificationBadgeProps {
  className?: string;
  variant?: 'warning' | 'success' | 'info';
  count?: number;
}

export const GameNotificationBadge: React.FC<GameNotificationBadgeProps> = ({ 
  className,
  variant = 'warning',
  count
}) => {
  const variantStyles = {
    warning: 'from-orange-400 to-orange-600',
    success: 'from-green-400 to-green-600', 
    info: 'from-blue-400 to-blue-600'
  };

  return (
    <div
      className={cn(
        "w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ml-1",
        "animate-pulse relative game-interactive-hover",
        `bg-gradient-to-br ${variantStyles[variant]}`,
        className
      )}
      style={{
        boxShadow: `0 0 6px rgba(251, 146, 60, 0.4), 0 2px 3px rgba(0, 0, 0, 0.1)`,
        animationDuration: '3s',
      }}
    >
      <span className="relative z-10 leading-none text-[10px]">
        {count ? (count > 9 ? '9+' : count) : '!'}
      </span>
      
      {/* Enhanced ping effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full opacity-30 animate-ping",
          `bg-gradient-to-br ${variantStyles[variant]}`
        )}
        style={{
          animationDuration: '4s',
        }}
      />
      
      {/* Additional celebration ring for success */}
      {variant === 'success' && (
        <div 
          className="absolute -inset-1 rounded-full border-2 border-green-400 opacity-50 animate-ping"
          style={{
            animationDuration: '2s',
          }}
        />
      )}
    </div>
  );
};
