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
    console.log('General Section Renderer - Profile data received:', {
      hasProfile: !!profile,
      firstName: profile?.first_name,
      lastName: profile?.last_name,
      email: profile?.email,
      phone: profile?.phone,
      location: profile?.location,
      designation: profile?.designation,
      biography: profile?.biography,
      profileImage: profile?.profile_image
    });
    console.log('General Section Renderer - Field mappings:', fieldMappings);

    // For general section, the data is directly on the profile object from general_information table
    if (!profile) {
      console.log('General Section Renderer - No profile data available');
      return '';
    }

    // Check if profile image should be shown
    const hasProfileImage = profile?.profile_image;
    
    // Get orientation from styling config or default to portrait
    const orientation = section.styling_config?.orientation || 'portrait';
    const isLandscape = orientation === 'landscape';
    const imageSize = isLandscape ? '60px' : '80px';
    
    // Helper function to check if a field is enabled based on field mappings
    const isFieldEnabled = (fieldName: string) => {
      const mapping = fieldMappings.find(m => m.original_field_name === fieldName);
      const enabled = mapping ? mapping.visibility_rules?.enabled !== false : true;
      console.log(`General Section Renderer - Field ${fieldName} enabled:`, enabled, 'mapping:', mapping);
      return enabled;
    };

    // Helper function to apply masking
    const applyMasking = (value: any, fieldName: string) => {
      const mapping = fieldMappings.find(m => m.original_field_name === fieldName);
      if (!mapping?.is_masked || !value) return value;

      if (mapping.mask_value) {
        return mapping.mask_value;
      } else {
        // Default masking
        if (typeof value === 'string' && value.length > 3) {
          return value.substring(0, 3) + '***';
        }
        return '***';
      }
    };
    
    // Create profile image HTML
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

    // Create name HTML (without labels, as header style)
    let nameHTML = '';
    const hasFirstName = isFieldEnabled('first_name') && profile?.first_name;
    const hasLastName = isFieldEnabled('last_name') && profile?.last_name;
    
    console.log('General Section Renderer - Name check:', {
      hasFirstName,
      hasLastName,
      firstName: profile?.first_name,
      lastName: profile?.last_name
    });
    
    if (hasFirstName || hasLastName) {
      const firstName = hasFirstName ? applyMasking(profile.first_name, 'first_name') : '';
      const lastName = hasLastName ? applyMasking(profile.last_name, 'last_name') : '';
      const fullName = `${firstName} ${lastName}`.trim();
      
      nameHTML = `<h1 style="
        font-size: 1.5em; 
        font-weight: bold; 
        margin: 0 0 8pt 0; 
        text-align: center;
        color: inherit;
      ">${fullName}</h1>`;
    }

    // Create other fields HTML (without labels)
    let fieldsHTML = '';
    
    // Email
    if (isFieldEnabled('email') && profile?.email) {
      fieldsHTML += `<p style="margin: 4pt 0; text-align: center; color: inherit;">
        ${applyMasking(profile.email, 'email')}
      </p>`;
    }
    
    // Phone
    if (isFieldEnabled('phone') && profile?.phone) {
      fieldsHTML += `<p style="margin: 4pt 0; text-align: center; color: inherit;">
        ${applyMasking(profile.phone, 'phone')}
      </p>`;
    }
    
    // Location
    if (isFieldEnabled('location') && profile?.location) {
      fieldsHTML += `<p style="margin: 4pt 0; text-align: center; color: inherit;">
        ${applyMasking(profile.location, 'location')}
      </p>`;
    }
    
    // Designation
    if (isFieldEnabled('designation') && profile?.designation) {
      fieldsHTML += `<p style="margin: 4pt 0; text-align: center; font-style: italic; color: inherit;">
        ${applyMasking(profile.designation, 'designation')}
      </p>`;
    }
    
    // Biography
    if (isFieldEnabled('biography') && profile?.biography) {
      fieldsHTML += `<p style="margin-top: 10pt; font-size: 0.9em; font-style: italic; text-align: center; color: inherit;">
        ${applyMasking(profile.biography, 'biography')}
      </p>`;
    }
    
    const finalHTML = `<div class="section general-section" style="text-align: center; margin-bottom: 20pt;">
      ${profileImageHTML}
      ${nameHTML}
      ${fieldsHTML}
    </div>`;

    console.log('General Section Renderer - Generated HTML length:', finalHTML.length);
    console.log('General Section Renderer - Generated HTML preview:', finalHTML.substring(0, 200) + '...');
    
    // Render as header-style section (no section title, centered content)
    return finalHTML;
  }
}
