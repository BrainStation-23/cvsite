
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Star, Sparkles } from 'lucide-react';

interface MilestoneCelebrationProps {
  isVisible: boolean;
  title: string;
  description?: string;
  type?: 'achievement' | 'level-up' | 'milestone';
  onComplete?: () => void;
  duration?: number;
}

export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
  isVisible,
  title,
  description,
  type = 'achievement',
  onComplete,
  duration = 3000
}) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldShow(true);
      const timer = setTimeout(() => {
        setShouldShow(false);
        onComplete?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onComplete]);

  const getIconAndStyles = () => {
    switch (type) {
      case 'level-up':
        return {
          icon: Sparkles,
          bgClass: 'bg-gradient-to-br from-purple-500 to-pink-500',
          iconClass: 'text-yellow-300'
        };
      case 'milestone':
        return {
          icon: Star,
          bgClass: 'bg-gradient-to-br from-blue-500 to-cyan-500',
          iconClass: 'text-white'
        };
      default:
        return {
          icon: Trophy,
          bgClass: 'bg-gradient-to-br from-yellow-400 to-orange-500',
          iconClass: 'text-white'
        };
    }
  };

  const { icon: Icon, bgClass, iconClass } = getIconAndStyles();

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className={cn(
        "relative rounded-2xl p-8 text-center text-white shadow-2xl max-w-md mx-4 animate-scale-in",
        bgClass
      )}>
        {/* Celebration particles */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/60 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10">
          <div className="animate-achievement-bounce mb-4">
            <Icon className={cn("h-16 w-16 mx-auto", iconClass)} />
          </div>
          
          <h2 className="text-2xl font-bold mb-2 animate-fade-in">
            {title}
          </h2>
          
          {description && (
            <p className="text-lg opacity-90 animate-fade-in">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
