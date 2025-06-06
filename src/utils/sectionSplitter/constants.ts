
export class SectionSplitterConstants {
  // Updated to handle both portrait and landscape modes
  static readonly A4_PORTRAIT_HEIGHT = 257 * 3.779528; // 257mm content height in pixels at 96 DPI
  static readonly A4_LANDSCAPE_HEIGHT = 167 * 3.779528; // 167mm content height in pixels at 96 DPI (297-40-40-50 for margins and header)
  static readonly SECTION_TITLE_HEIGHT = 30; // Estimated height for section titles
  static readonly ITEM_MARGIN = 16; // Margin between items
  static readonly SAFETY_MARGIN = 40; // Additional safety margin to prevent overflow
  static readonly CHARS_PER_LINE = 80; // Characters per line for text estimation
  static readonly TECH_ITEMS_PER_LINE = 6; // Technologies per line
  static readonly TECH_LINE_HEIGHT = 25; // Height per technology line
  static readonly BASE_LINE_HEIGHT = 20; // Base line height for text
}
