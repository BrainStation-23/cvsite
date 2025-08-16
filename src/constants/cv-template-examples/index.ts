
import { COMPREHENSIVE_SIDEBAR_TEMPLATE } from './comprehensive-sidebar';
import { SINGLE_COLUMN_TEMPLATE } from './single-column';
import { BASIC_TEMPLATE } from './basic';

export const STRUCTURE_EXAMPLES = {
  comprehensive: COMPREHENSIVE_SIDEBAR_TEMPLATE,
  singleColumn: SINGLE_COLUMN_TEMPLATE,
  basic: BASIC_TEMPLATE
};

export const EXAMPLE_CV_TEMPLATE = STRUCTURE_EXAMPLES.comprehensive;

// Export individual templates for direct access
export { COMPREHENSIVE_SIDEBAR_TEMPLATE, SINGLE_COLUMN_TEMPLATE, BASIC_TEMPLATE };
