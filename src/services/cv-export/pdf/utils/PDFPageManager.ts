import jsPDF from 'jspdf';

export interface PageMetrics {
  width: number;
  height: number;
  contentWidth: number;
  contentHeight: number;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface ContentBlock {
  type: 'section' | 'image' | 'text' | 'item' | 'page_break';
  content: any;
  estimatedHeight: number;
  minHeight?: number;
  canSplit?: boolean;
  splitData?: {
    sectionType: string;
    sectionConfig: any;
    items?: any[];
    startIndex?: number;
  };
}

export class PDFPageManager {
  private doc: jsPDF;
  private metrics: PageMetrics;
  private currentY: number;
  private currentPage: number;

  constructor(doc: jsPDF, margins = { top: 20, bottom: 20, left: 20, right: 20 }) {
    this.doc = doc;
    this.currentPage = 1;
    this.currentY = margins.top;
    
    this.metrics = {
      width: doc.internal.pageSize.width,
      height: doc.internal.pageSize.height,
      contentWidth: doc.internal.pageSize.width - margins.left - margins.right,
      contentHeight: doc.internal.pageSize.height - margins.top - margins.bottom,
      margins
    };
  }

  getCurrentY(): number {
    return this.currentY;
  }

  getCurrentPage(): number {
    return this.currentPage;
  }

  getAvailableHeight(): number {
    return this.metrics.height - this.metrics.margins.bottom - this.currentY;
  }

  getContentX(): number {
    return this.metrics.margins.left;
  }

  getContentWidth(): number {
    return this.metrics.contentWidth;
  }

  canFitContent(height: number, minHeight?: number): boolean {
    const availableHeight = this.getAvailableHeight();
    
    // If we specify a minimum height, check if we can fit at least that
    if (minHeight && minHeight > 0) {
      return availableHeight >= minHeight;
    }
    
    return availableHeight >= height;
  }

  addNewPage(): void {
    this.doc.addPage();
    this.currentPage++;
    this.currentY = this.metrics.margins.top;
  }

  advanceY(height: number): void {
    this.currentY += height;
  }

  reserveSpace(height: number): boolean {
    if (this.canFitContent(height)) {
      this.advanceY(height);
      return true;
    }
    return false;
  }

  ensureSpace(height: number, minHeight?: number): void {
    if (!this.canFitContent(height, minHeight)) {
      this.addNewPage();
    }
  }

  splitContentAcrossPages(blocks: ContentBlock[]): ContentBlock[][] {
    const pages: ContentBlock[][] = [];
    let currentPageBlocks: ContentBlock[] = [];
    let tempY = this.currentY;

    for (const block of blocks) {
      const availableHeight = this.metrics.height - this.metrics.margins.bottom - tempY;

      // If block fits entirely on current page
      if (block.estimatedHeight <= availableHeight) {
        currentPageBlocks.push(block);
        tempY += block.estimatedHeight;
      }
      // If block can be split and is too large
      else if (block.canSplit && availableHeight > (block.minHeight || 50)) {
        // Split the block
        const splitBlocks = this.splitBlock(block, availableHeight);
        
        // Add first part to current page
        if (splitBlocks.firstPart) {
          currentPageBlocks.push(splitBlocks.firstPart);
          tempY += splitBlocks.firstPart.estimatedHeight;
        }

        // Start new page with remaining parts
        if (currentPageBlocks.length > 0) {
          pages.push(currentPageBlocks);
          currentPageBlocks = [];
          tempY = this.metrics.margins.top;
        }

        // Add remaining parts to new page(s)
        if (splitBlocks.remainingParts) {
          for (const part of splitBlocks.remainingParts) {
            // Check if this part fits on current page
            const newAvailableHeight = this.metrics.height - this.metrics.margins.bottom - tempY;
            if (part.estimatedHeight <= newAvailableHeight) {
              currentPageBlocks.push(part);
              tempY += part.estimatedHeight;
            } else {
              // Start another new page
              if (currentPageBlocks.length > 0) {
                pages.push(currentPageBlocks);
                currentPageBlocks = [];
                tempY = this.metrics.margins.top;
              }
              currentPageBlocks.push(part);
              tempY += part.estimatedHeight;
            }
          }
        }
      }
      // If block doesn't fit and can't be split, start new page
      else {
        if (currentPageBlocks.length > 0) {
          pages.push(currentPageBlocks);
          currentPageBlocks = [];
          tempY = this.metrics.margins.top;
        }
        currentPageBlocks.push(block);
        tempY += block.estimatedHeight;
      }
    }

    // Add final page if it has content
    if (currentPageBlocks.length > 0) {
      pages.push(currentPageBlocks);
    }

    return pages;
  }

  private splitBlock(block: ContentBlock, availableHeight: number): {
    firstPart?: ContentBlock;
    remainingParts?: ContentBlock[];
  } {
    switch (block.type) {
      case 'section':
        return this.splitSection(block, availableHeight);
      case 'image':
        return this.splitImage(block, availableHeight);
      case 'item':
        return this.splitItem(block, availableHeight);
      default:
        return { remainingParts: [block] };
    }
  }

  private splitSection(block: ContentBlock, availableHeight: number): {
    firstPart?: ContentBlock;
    remainingParts?: ContentBlock[];
  } {
    const { content } = block;
    const titleHeight = 30; // Estimated section title height
    const itemMargin = 10;

    if (availableHeight < titleHeight + 50) {
      // Not enough space for title + minimal content
      return { remainingParts: [block] };
    }

    const availableForItems = availableHeight - titleHeight;
    const items = Array.isArray(content) ? content : [content];
    let usedHeight = 0;
    let splitIndex = 0;

    // Find how many items can fit
    for (let i = 0; i < items.length; i++) {
      const itemHeight = this.estimateItemHeight(items[i], block.splitData?.sectionType);
      if (usedHeight + itemHeight + itemMargin <= availableForItems) {
        usedHeight += itemHeight + itemMargin;
        splitIndex = i + 1;
      } else {
        break;
      }
    }

    if (splitIndex === 0) {
      // Can't fit any items, move entire block
      return { remainingParts: [block] };
    }

    if (splitIndex >= items.length) {
      // All items fit
      return { firstPart: block };
    }

    // Split the section
    const firstPart: ContentBlock = {
      ...block,
      content: items.slice(0, splitIndex),
      estimatedHeight: titleHeight + usedHeight
    };

    const remainingPart: ContentBlock = {
      ...block,
      content: items.slice(splitIndex),
      estimatedHeight: titleHeight + (block.estimatedHeight - titleHeight - usedHeight),
      splitData: {
        ...block.splitData,
        isContinuation: true
      }
    };

    return {
      firstPart,
      remainingParts: [remainingPart]
    };
  }

  private splitImage(block: ContentBlock, availableHeight: number): {
    firstPart?: ContentBlock;
    remainingParts?: ContentBlock[];
  } {
    // For now, images are not splittable - they move to next page entirely
    return { remainingParts: [block] };
  }

  private splitItem(block: ContentBlock, availableHeight: number): {
    firstPart?: ContentBlock;
    remainingParts?: ContentBlock[];
  } {
    // For now, items are not splittable - they move to next page entirely
    return { remainingParts: [block] };
  }

  private estimateItemHeight(item: any, sectionType?: string): number {
    switch (sectionType) {
      case 'experience':
        return 80 + (item.description ? Math.min(100, item.description.length * 0.5) : 0);
      case 'projects':
        return 60 + (item.description ? Math.min(80, item.description.length * 0.4) : 0);
      case 'education':
        return 50;
      case 'achievements':
        return 40;
      default:
        return 40;
    }
  }
}
