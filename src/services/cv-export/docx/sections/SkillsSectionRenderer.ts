
import { Paragraph, Table, TableRow, TableCell, TextRun, WidthType } from 'docx';
import { BaseSectionRenderer } from './BaseSectionRenderer';

export class SkillsSectionRenderer extends BaseSectionRenderer {
  render(skills: any[], styles: any): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      if (skills.length === 0) return elements;

      // Create a properly formatted table for skills
      const skillRows: TableRow[] = [];
      
      // Group skills into rows of 3 skills each for better formatting
      const skillsPerRow = 3;
      for (let i = 0; i < skills.length; i += skillsPerRow) {
        const rowSkills = skills.slice(i, i + skillsPerRow);
        
        const cells: TableCell[] = rowSkills.map(skill => {
          const skillText = skill.proficiency 
            ? `${skill.name} (${skill.proficiency}/10)` 
            : skill.name;
          
          return new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: skillText,
                    size: this.styler.getFontSize('base')
                  })
                ],
                spacing: { before: 60, after: 60 }
              })
            ],
            width: {
              size: 33.33,
              type: WidthType.PERCENTAGE
            }
          });
        });
        
        // Fill remaining cells if needed
        while (cells.length < skillsPerRow) {
          cells.push(new TableCell({
            children: [new Paragraph({ children: [] })],
            width: {
              size: 33.33,
              type: WidthType.PERCENTAGE
            }
          }));
        }
        
        skillRows.push(new TableRow({
          children: cells
        }));
      }

      if (skillRows.length > 0) {
        elements.push(new Table({
          rows: skillRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE
          }
        }));
      }
    } catch (error) {
      console.error('Error rendering skills section:', error);
    }

    return elements;
  }
}
