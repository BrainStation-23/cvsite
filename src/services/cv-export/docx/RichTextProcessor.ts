
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
      const itemContent = item.replace(/<\/?li>/gi, '').trim();
      const textRuns = this.parseHtmlToTextRuns(itemContent, fontSize);
      
      if (textRuns.length > 0) {
        // Add bullet point or number
        const bullet = listType === 'ol' ? `${index + 1}. ` : '• ';
        const bulletRun = new TextRun({ text: bullet, size: fontSize });
        
        paragraphs.push(new Paragraph({
          children: [bulletRun, ...textRuns],
          spacing: { after: 60 },
          alignment: AlignmentType.JUSTIFIED,
          indent: { left: 360 } // Indent list items
        }));
      }
    });
    
    return paragraphs;
  }

  private parseRegularContent(content: string, fontSize: number): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    
    // Split into paragraphs first
    const htmlParagraphs = content
      .split(/<\/p>/gi)
      .map(p => p.replace(/<p[^>]*>/gi, '').trim())
      .filter(p => p.length > 0);
    
    htmlParagraphs.forEach(paragraphHtml => {
      const textRuns = this.parseHtmlToTextRuns(paragraphHtml, fontSize);
      if (textRuns.length > 0) {
        paragraphs.push(new Paragraph({
          children: textRuns,
          spacing: { after: 120 },
          alignment: AlignmentType.JUSTIFIED
        }));
      }
    });
    
    // If no paragraphs were created, create a single paragraph
    if (paragraphs.length === 0 && content.trim()) {
      const textRuns = this.parseHtmlToTextRuns(content, fontSize);
      if (textRuns.length > 0) {
        paragraphs.push(new Paragraph({
          children: textRuns,
          spacing: { after: 120 },
          alignment: AlignmentType.JUSTIFIED
        }));
      }
    }
    
    return paragraphs;
  }

  private parseHtmlToTextRuns(html: string, fontSize: number): TextRun[] {
    const runs: TextRun[] = [];
    
    // Handle line breaks first
    const parts = html.split(/<br\s*\/?>/gi);
    
    parts.forEach((part, partIndex) => {
      if (partIndex > 0) {
        runs.push(new TextRun({ text: '\n', size: fontSize }));
      }
      
      // Process formatting tags
      let currentText = part;
      let currentPos = 0;
      
      const formatRegex = /<(\/?)([^>]+)>/g;
      let match;
      
      const formatStack: Array<{ tag: string; bold?: boolean; italic?: boolean; underline?: boolean }> = [];
      
      while ((match = formatRegex.exec(currentText)) !== null) {
        const [fullMatch, isClosing, tagContent] = match;
        const tagName = tagContent.toLowerCase().split(' ')[0];
        
        // Add text before this tag
        if (match.index > currentPos) {
          const textBefore = currentText.substring(currentPos, match.index);
          if (textBefore.trim()) {
            const currentFormat = this.getCurrentFormat(formatStack);
            runs.push(new TextRun({
              text: textBefore,
              size: fontSize,
              ...currentFormat
            }));
          }
        }
        
        // Handle tag
        if (isClosing === '/') {
          // Remove last matching tag from stack
          for (let i = formatStack.length - 1; i >= 0; i--) {
            if (formatStack[i].tag === tagName) {
              formatStack.splice(i, 1);
              break;
            }
          }
        } else {
          // Add tag to stack
          const formatProps: any = { tag: tagName };
          switch (tagName) {
            case 'strong':
            case 'b':
              formatProps.bold = true;
              break;
            case 'em':
            case 'i':
              formatProps.italic = true;
              break;
            case 'u':
              formatProps.underline = true;
              break;
          }
          formatStack.push(formatProps);
        }
        
        currentPos = match.index + fullMatch.length;
      }
      
      // Add remaining text
      if (currentPos < currentText.length) {
        const remainingText = currentText.substring(currentPos).replace(/<[^>]*>/g, '');
        if (remainingText.trim()) {
          const currentFormat = this.getCurrentFormat(formatStack);
          runs.push(new TextRun({
            text: remainingText,
            size: fontSize,
            ...currentFormat
          }));
        }
      }
      
      // If no formatted content was found, just add the plain text
      if (runs.length === 0 || (partIndex === 0 && currentPos === 0)) {
        const plainText = currentText.replace(/<[^>]*>/g, '').trim();
        if (plainText) {
          runs.push(new TextRun({
            text: plainText,
            size: fontSize
          }));
        }
      }
    });
    
    return runs;
  }

  private getCurrentFormat(formatStack: Array<{ tag: string; bold?: boolean; italic?: boolean; underline?: boolean }>): object {
    const format: any = {};
    
    formatStack.forEach(item => {
      if (item.bold) format.bold = true;
      if (item.italic) format.italics = true;
      if (item.underline) format.underline = true;
    });
    
    return format;
  }
}
