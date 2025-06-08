
import { HTMLFieldProcessor } from '../HTMLFieldProcessor';

interface TemplateSection {
  id: string;
  section_type: string;
  display_order: number;
  is_required: boolean;
  field_mapping: Record<string, any>;
  styling_config: Record<string, any>;
}

interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

export class GeneralSectionRenderer {
  constructor(private fieldProcessor: HTMLFieldProcessor) {}

  render(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Personal Information';
    
    // Check if profile image should be shown
    const hasProfileImage = profile.profile_image;
    
    // Get orientation from styling config or default to portrait
    const orientation = section.styling_config?.orientation || 'portrait';
    const isLandscape = orientation === 'landscape';
    const imageSize = isLandscape ? '60px' : '80px';
    
    // Create a proper fixed-size container that matches the preview approach
    const profileImageHTML = hasProfileImage ? `
      <div class="profile-image-container" style="
        margin-bottom: 10pt; 
        text-align: center;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      ">
        <div class="profile-image-wrapper" style="
          width: ${imageSize};
          height: ${imageSize};
          position: relative;
          display: inline-block;
          flex-shrink: 0;
        ">
          <img 
            src="${profile.profile_image}" 
            alt="Profile" 
            class="profile-image"
            style="
              width: 100%;
              height: 100%;
              border-radius: 4px; 
              object-fit: cover;
              border: 1px solid #e5e7eb;
              display: block;
            " 
          />
        </div>
      </div>
    ` : '';
    
    return `<div class="section general-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        ${profileImageHTML}
        ${this.fieldProcessor.processField('first_name', profile.first_name, fieldMappings, 'general')}
        ${this.fieldProcessor.processField('last_name', profile.last_name, fieldMappings, 'general')}
        ${this.fieldProcessor.processField('email', profile.email, fieldMappings, 'general')}
        ${this.fieldProcessor.processField('phone', profile.phone, fieldMappings, 'general')}
        ${this.fieldProcessor.processField('location', profile.location, fieldMappings, 'general')}
        ${this.fieldProcessor.processField('designation', profile.designation, fieldMappings, 'general')}
        ${profile.biography ? `<p style="margin-top: 10pt; font-size: 0.9em; font-style: italic;">${profile.biography}</p>` : ''}
      </div>
    </div>`;
  }
}
