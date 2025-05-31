
import { Paragraph, Table } from 'docx';
import { BaseSectionRenderer } from './BaseSectionRenderer';

export class AchievementsSectionRenderer extends BaseSectionRenderer {
  render(achievements: any[], styles: any): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      achievements.forEach((achievement) => {
        // Check field visibility and apply masking
        const showTitle = this.isFieldVisible('title', 'achievements');
        const showDescription = this.isFieldVisible('description', 'achievements');
        const showDate = this.isFieldVisible('date', 'achievements');

        // Achievement Title
        if (showTitle) {
          const title = this.applyFieldMasking(achievement.title, 'title', 'achievements');
          if (title) {
            elements.push(this.styler.createItemTitle(title, baseStyles));
          }
        }

        // Date
        if (showDate && achievement.date) {
          const achievementDate = this.applyFieldMasking(
            new Date(achievement.date).toLocaleDateString(), 
            'date', 
            'achievements'
          );
          elements.push(this.styler.createItemSubtitle(achievementDate, baseStyles));
        }

        // Description
        if (showDescription) {
          const description = this.applyFieldMasking(achievement.description, 'description', 'achievements');
          if (description) {
            elements.push(this.styler.createRegularText(description, baseStyles));
          }
        }
      });
    } catch (error) {
      console.error('Error rendering achievements section:', error);
    }

    return elements;
  }
}
