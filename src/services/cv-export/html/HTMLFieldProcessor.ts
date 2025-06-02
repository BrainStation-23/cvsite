
export class HTMLFieldProcessor {
  processFieldWithDebug(value: any, fieldName: string, sectionType: string, fieldMappings: any[]): any {
    console.log(`\n--- Processing field: ${fieldName} in section: ${sectionType} ---`);
    console.log(`Original value:`, value);
    
    if (!fieldMappings || fieldMappings.length === 0) {
      console.log('No field mappings found - showing field by default');
      return value;
    }
    
    const mapping = fieldMappings.find(m => 
      m.original_field_name === fieldName && 
      m.section_type === sectionType
    );
    
    console.log(`Found mapping:`, mapping);
    
    if (!mapping) {
      console.log('No mapping found for this field - checking if field is globally disabled');
      
      // Check if any field mapping exists for this section
      const sectionHasMappings = fieldMappings.some(m => m.section_type === sectionType);
      
      if (sectionHasMappings) {
        console.log('Section has mappings but this field is not included - field is DISABLED');
        return null; // Field is disabled
      } else {
        console.log('Section has no mappings - showing field by default');
        return value;
      }
    }
    
    // Check visibility rules first
    const visibilityRules = mapping.visibility_rules || {};
    console.log(`Visibility rules:`, visibilityRules);
    
    if (visibilityRules.enabled === false) {
      console.log('Field is explicitly DISABLED by visibility rules');
      return null;
    }
    
    // Apply masking if configured
    if (mapping.is_masked && value !== null && value !== undefined) {
      console.log('Field is MASKED');
      
      if (mapping.mask_value) {
        console.log(`Using custom mask value: ${mapping.mask_value}`);
        return mapping.mask_value;
      } else {
        // Default masking behavior
        if (typeof value === 'string') {
          const maskedValue = value.length <= 3 ? '***' : value.substring(0, 3) + '***';
          console.log(`Using default masking: ${maskedValue}`);
          return maskedValue;
        }
        
        console.log('Using default mask: ***');
        return '***';
      }
    }
    
    console.log('Field is VISIBLE and NOT MASKED');
    return value;
  }

  formatDateRange(startDate: string, endDate: string, isCurrent: boolean): string {
    const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    }) : '';
    const end = isCurrent ? 'Present' : (endDate ? new Date(endDate).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    }) : '');
    
    if (start && end) {
      return `${start} - ${end}`;
    } else if (start) {
      return start;
    } else if (end) {
      return end;
    }
    return '';
  }

  processRichText(content: string): string {
    if (!content) return '';
    
    // Handle common HTML tags and convert to proper HTML with justified text
    return content
      .replace(/\n/g, '<br>')
      .replace(/<p>/g, '<p style="text-align: justify; margin-bottom: 8pt;">')
      .replace(/<\/p>/g, '</p>')
      .replace(/<strong>/g, '<strong>')
      .replace(/<\/strong>/g, '</strong>')
      .replace(/<em>/g, '<em>')
      .replace(/<\/em>/g, '</em>')
      .replace(/<ul>/g, '<ul style="margin-left: 15pt; margin-bottom: 8pt;">')
      .replace(/<\/ul>/g, '</ul>')
      .replace(/<ol>/g, '<ol style="margin-left: 15pt; margin-bottom: 8pt;">')
      .replace(/<\/ol>/g, '</ol>')
      .replace(/<li>/g, '<li style="margin-bottom: 3pt;">')
      .replace(/<\/li>/g, '</li>');
  }
}
