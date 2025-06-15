
import { GeneralInfo, Skill, Experience, Education, Training, Achievement, Project } from '@/types';

export interface ProfileData {
  generalInfo?: GeneralInfo;
  technicalSkills: Skill[];
  specializedSkills: Skill[];
  experiences: Experience[];
  education: Education[];
  trainings: Training[];
  achievements: Achievement[];
  projects: Project[];
}

export interface GamificationStats {
  profileCompletion: number;
  currentXP: number;
  currentLevel: number;
  xpForNextLevel: number;
  xpToNextLevel: number;
}

export class GamificationService {
  // XP values for different actions
  private static readonly XP_VALUES = {
    PROFILE_IMAGE: 50,
    BASIC_INFO: 100,
    BIOGRAPHY: 75,
    FIRST_SKILL: 25,
    ADDITIONAL_SKILL: 10,
    FIRST_EXPERIENCE: 100,
    ADDITIONAL_EXPERIENCE: 50,
    FIRST_EDUCATION: 75,
    ADDITIONAL_EDUCATION: 25,
    FIRST_TRAINING: 50,
    ADDITIONAL_TRAINING: 20,
    FIRST_ACHIEVEMENT: 75,
    ADDITIONAL_ACHIEVEMENT: 30,
    FIRST_PROJECT: 100,
    ADDITIONAL_PROJECT: 40,
    PROFILE_COMPLETE: 200
  };

  // Level thresholds
  private static readonly LEVEL_THRESHOLDS = [
    0, 300, 750, 1500, 2500, 4000, 6000, 8500, 11500, 15000, 19000, 24000, 30000
  ];

  static calculateProfileCompletion(data: ProfileData): number {
    let completed = 0;
    let total = 8; // Total completion criteria

    // Basic info (first name, last name)
    if (data.generalInfo?.firstName && data.generalInfo?.lastName) {
      completed++;
    }

    // Profile image
    if (data.generalInfo?.profileImage) {
      completed++;
    }

    // Biography
    if (data.generalInfo?.biography && data.generalInfo.biography.trim().length > 0) {
      completed++;
    }

    // Skills
    if (data.technicalSkills.length > 0 || data.specializedSkills.length > 0) {
      completed++;
    }

    // Experience
    if (data.experiences.length > 0) {
      completed++;
    }

    // Education
    if (data.education.length > 0) {
      completed++;
    }

    // Projects
    if (data.projects.length > 0) {
      completed++;
    }

    // Achievements or trainings
    if (data.achievements.length > 0 || data.trainings.length > 0) {
      completed++;
    }

    return Math.round((completed / total) * 100);
  }

  static calculateXP(data: ProfileData): number {
    let totalXP = 0;

    // Basic info XP
    if (data.generalInfo?.firstName && data.generalInfo?.lastName) {
      totalXP += this.XP_VALUES.BASIC_INFO;
    }

    // Profile image XP
    if (data.generalInfo?.profileImage) {
      totalXP += this.XP_VALUES.PROFILE_IMAGE;
    }

    // Biography XP
    if (data.generalInfo?.biography && data.generalInfo.biography.trim().length > 0) {
      totalXP += this.XP_VALUES.BIOGRAPHY;
    }

    // Skills XP
    const totalSkills = data.technicalSkills.length + data.specializedSkills.length;
    if (totalSkills > 0) {
      totalXP += this.XP_VALUES.FIRST_SKILL;
      totalXP += (totalSkills - 1) * this.XP_VALUES.ADDITIONAL_SKILL;
    }

    // Experience XP
    if (data.experiences.length > 0) {
      totalXP += this.XP_VALUES.FIRST_EXPERIENCE;
      totalXP += (data.experiences.length - 1) * this.XP_VALUES.ADDITIONAL_EXPERIENCE;
    }

    // Education XP
    if (data.education.length > 0) {
      totalXP += this.XP_VALUES.FIRST_EDUCATION;
      totalXP += (data.education.length - 1) * this.XP_VALUES.ADDITIONAL_EDUCATION;
    }

    // Training XP
    if (data.trainings.length > 0) {
      totalXP += this.XP_VALUES.FIRST_TRAINING;
      totalXP += (data.trainings.length - 1) * this.XP_VALUES.ADDITIONAL_TRAINING;
    }

    // Achievement XP
    if (data.achievements.length > 0) {
      totalXP += this.XP_VALUES.FIRST_ACHIEVEMENT;
      totalXP += (data.achievements.length - 1) * this.XP_VALUES.ADDITIONAL_ACHIEVEMENT;
    }

    // Project XP
    if (data.projects.length > 0) {
      totalXP += this.XP_VALUES.FIRST_PROJECT;
      totalXP += (data.projects.length - 1) * this.XP_VALUES.ADDITIONAL_PROJECT;
    }

    // Completion bonus
    const completion = this.calculateProfileCompletion(data);
    if (completion >= 100) {
      totalXP += this.XP_VALUES.PROFILE_COMPLETE;
    }

    return totalXP;
  }

  static calculateLevel(xp: number): number {
    for (let i = this.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= this.LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  static calculateLevelProgress(xp: number): { xpForNextLevel: number; xpToNextLevel: number } {
    const currentLevel = this.calculateLevel(xp);
    const nextLevelIndex = Math.min(currentLevel, this.LEVEL_THRESHOLDS.length - 1);
    const currentLevelXP = this.LEVEL_THRESHOLDS[currentLevel - 1] || 0;
    const nextLevelXP = this.LEVEL_THRESHOLDS[nextLevelIndex] || this.LEVEL_THRESHOLDS[this.LEVEL_THRESHOLDS.length - 1];
    
    const xpForNextLevel = nextLevelXP - currentLevelXP;
    const xpToNextLevel = nextLevelXP - xp;

    return {
      xpForNextLevel: Math.max(xpForNextLevel, 1),
      xpToNextLevel: Math.max(xpToNextLevel, 0)
    };
  }

  static getGamificationStats(data: ProfileData): GamificationStats {
    const profileCompletion = this.calculateProfileCompletion(data);
    const currentXP = this.calculateXP(data);
    const currentLevel = this.calculateLevel(currentXP);
    const { xpForNextLevel, xpToNextLevel } = this.calculateLevelProgress(currentXP);

    return {
      profileCompletion,
      currentXP,
      currentLevel,
      xpForNextLevel,
      xpToNextLevel
    };
  }
}
