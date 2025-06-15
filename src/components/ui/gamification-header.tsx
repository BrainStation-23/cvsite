
import React from 'react';
import { cn } from '@/lib/utils';
import { ProfileCompletionProgress } from './profile-completion-progress';
import { XPLevelDisplay } from './xp-level-display';
import { AchievementBadge, AchievementTier } from './achievement-badge';
import { Award, Target, Users, Calendar } from 'lucide-react';

interface Achievement {
  id: string;
  tier: AchievementTier;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  isUnlocked: boolean;
}

interface GamificationHeaderProps {
  profileCompletion: number;
  currentXP: number;
  currentLevel: number;
  xpForNextLevel: number;
  xpToNextLevel: number;
  recentAchievements?: Achievement[];
  className?: string;
}

export const GamificationHeader: React.FC<GamificationHeaderProps> = ({
  profileCompletion,
  currentXP,
  currentLevel,
  xpForNextLevel,
  xpToNextLevel,
  recentAchievements = [],
  className
}) => {
  // Sample achievements for demonstration
  const defaultAchievements: Achievement[] = [
    {
      id: 'profile-complete',
      tier: 'gold',
      icon: Target,
      title: 'Profile Master',
      description: 'Complete 100% of your profile',
      isUnlocked: profileCompletion >= 100
    },
    {
      id: 'first-experience',
      tier: 'bronze',
      icon: Award,
      title: 'Career Starter',
      description: 'Add your first work experience',
      isUnlocked: profileCompletion >= 30
    },
    {
      id: 'skill-collector',
      tier: 'silver',
      icon: Users,
      title: 'Skill Collector',
      description: 'Add 5 or more skills',
      isUnlocked: profileCompletion >= 50
    },
    {
      id: 'active-member',
      tier: 'platinum',
      icon: Calendar,
      title: 'Active Member',
      description: 'Stay active for 30 days',
      isUnlocked: false
    }
  ];

  const achievements = recentAchievements.length > 0 ? recentAchievements : defaultAchievements;
  const displayAchievements = achievements.slice(0, 4);

  return (
    <div className={cn(
      "bg-gradient-to-r from-game-level-bg to-game-progress-bg rounded-xl p-6 text-white shadow-lg",
      className
    )}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Completion */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-game-level-text">Your Progress</h3>
          <ProfileCompletionProgress 
            completionPercentage={profileCompletion}
            showDetails={false}
          />
        </div>

        {/* XP and Level */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-game-level-text">Experience</h3>
          <XPLevelDisplay
            currentXP={currentXP}
            currentLevel={currentLevel}
            xpForNextLevel={xpForNextLevel}
            xpToNextLevel={xpToNextLevel}
            showDetails={false}
          />
        </div>

        {/* Recent Achievements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-game-level-text">Achievements</h3>
          <div className="flex gap-2">
            {displayAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                tier={achievement.tier}
                icon={achievement.icon}
                title={achievement.title}
                description={achievement.description}
                isUnlocked={achievement.isUnlocked}
                size="sm"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
