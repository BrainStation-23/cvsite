
export interface RichTextElement {
  type: string;
  content: string;
  style?: any;
}

export class RichTextParser {
  parseRichText(htmlContent: string): RichTextElement[] {
    if (!htmlContent) return [];
    
    const elements: RichTextElement[] = [];
    
    // Parse paragraphs
    const paragraphRegex = /<p>(.*?)<\/p>/gis;
    const listRegex = /<(ul|ol)>(.*?)<\/\1>/gis;
    
    let match;
    
    // Process paragraphs
    while ((match = paragraphRegex.exec(htmlContent)) !== null) {
      const [, content] = match;
      const cleanContent = this.cleanHtmlTags(content);
      
      if (cleanContent.trim()) {
        // Check for bold content
        const isBold = content.includes('<strong>') || content.includes('<b>');
        elements.push({
          type: 'paragraph',
          content: cleanContent,
          style: isBold ? { bold: true } : undefined
        });
      }
    }
    
    // Reset regex
    htmlContent.replace(paragraphRegex, '');
    
    // Process lists
    while ((match = listRegex.exec(htmlContent)) !== null) {
      const [, listType, listContent] = match;
      const listItems = listContent.match(/<li>(.*?)<\/li>/gis) || [];
      
      listItems.forEach(item => {
        const cleanItem = this.cleanHtmlTags(item.replace(/<\/?li>/gi, ''));
        if (cleanItem.trim()) {
          elements.push({
            type: 'listItem',
            content: cleanItem,
            style: { bullet: listType === 'ul' ? '•' : '1.' }
          });
        }
      });
    }
    
    // If no structured content found, treat as plain text
    if (elements.length === 0) {
      const cleanContent = this.cleanHtmlTags(htmlContent);
      if (cleanContent.trim()) {
        elements.push({
          type: 'paragraph',
          content: cleanContent
        });
      }
    }
    
    return elements;
  }

  private cleanHtmlTags(content: string): string {
    if (!content) return '';
    
    return content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}
