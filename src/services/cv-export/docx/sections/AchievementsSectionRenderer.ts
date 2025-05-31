
import { Paragraph, Table } from 'docx';
import { BaseSectionRenderer } from './BaseSectionRenderer';

export class AchievementsSectionRenderer extends BaseSectionRenderer {
  render(achievements: any[], styles: any): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      achievements.forEach((achievement) => {
        // Apply masking to each field
        const title = this.maskingService.applyMasking(achievement.title, 'title', 'achievements');
        const description = this.maskingService.applyMasking(achievement.description, 'description', 'achievements');

        // Achievement Title
        if (title) {
          elements.push(this.styler.createItemTitle(title, baseStyles));
        }

        // Date
        if (achievement.date) {
          const achievementDate = this.maskingService.applyMasking(
            new Date(achievement.date).toLocaleDateString(), 
            'date', 
            'achievements'
          );
          elements.push(this.styler.createItemSubtitle(achievementDate, baseStyles));
        }

        // Description
        if (description) {
          elements.push(this.styler.createRegularText(description, baseStyles));
        }
      });
    } catch (error) {
      console.error('Error rendering achievements section:', error);
    }

    return elements;
  }
}
