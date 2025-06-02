
import { Paragraph, TextRun, AlignmentType } from 'docx';

export class RichTextProcessor {
  parseRichTextToDocx(htmlContent: string, baseStyles: any): Paragraph[] {
    if (!htmlContent) return [];
    
    const fontSize = (baseStyles.baseFontSize || 12) * 2;
    const paragraphs: Paragraph[] = [];
    
    // Handle lists specially
    const listRegex = /<(ul|ol)>(.*?)<\/\1>/gis;
    const listMatches = Array.from(htmlContent.matchAll(listRegex));
    
    let lastIndex = 0;
    
    for (const match of listMatches) {
      const [fullMatch, listType, listContent] = match;
      const matchIndex = match.index || 0;
      
      // Process content before the list
      if (matchIndex > lastIndex) {
        const beforeListContent = htmlContent.substring(lastIndex, matchIndex);
        const beforeParagraphs = this.parseRegularContent(beforeListContent, fontSize);
        paragraphs.push(...beforeParagraphs);
      }
      
      // Process the list
      const listParagraphs = this.parseListContent(listContent, listType, fontSize);
      paragraphs.push(...listParagraphs);
      
      lastIndex = matchIndex + fullMatch.length;
    }
    
    // Process remaining content after the last list
    if (lastIndex < htmlContent.length) {
      const remainingContent = htmlContent.substring(lastIndex);
      const remainingParagraphs = this.parseRegularContent(remainingContent, fontSize);
      paragraphs.push(...remainingParagraphs);
    }
    
    // If no lists were found, parse as regular content
    if (listMatches.length === 0) {
      return this.parseRegularContent(htmlContent, fontSize);
    }
    
    return paragraphs;
  }

  private parseListContent(listContent: string, listType: string, fontSize: number): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    const listItems = listContent.match(/<li>(.*?)<\/li>/gis) || [];
    
    listItems.forEach((item, index) => {
      // Clean the item content and remove HTML tags
      const itemContent = item
        .replace(/<\/?li>/gi, '')
        .replace(/<[^>]*>/g, '') // Remove all HTML tags
        .trim();
      
      if (itemContent) {
        // Add bullet point or number
        const bullet = listType === 'ol' ? `${index + 1}. ` : '• ';
        
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({ 
              text: bullet + itemContent, 
              size: fontSize 
            })
          ],
          spacing: { after: 60 },
          alignment: AlignmentType.JUSTIFIED,
          indent: { left: 360 }
        }));
      }
    });
    
    return paragraphs;
  }

  private parseRegularContent(content: string, fontSize: number): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    
    // Clean and split into paragraphs
    const cleanContent = content
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    if (cleanContent) {
      const textParts = cleanContent.split(/\n+/).filter(part => part.trim());
      
      textParts.forEach(part => {
        if (part.trim()) {
          paragraphs.push(new Paragraph({
            children: [
              new TextRun({
                text: part.trim(),
                size: fontSize
              })
            ],
            spacing: { after: 120 },
            alignment: AlignmentType.JUSTIFIED
          }));
        }
      });
      
      // If no parts, create single paragraph
      if (textParts.length === 0 && cleanContent) {
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({
              text: cleanContent,
              size: fontSize
            })
          ],
          spacing: { after: 120 },
          alignment: AlignmentType.JUSTIFIED
        }));
      }
    }
    
    return paragraphs;
  }
}
