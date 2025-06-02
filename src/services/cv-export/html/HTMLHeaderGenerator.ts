
import { HTMLFieldProcessor } from './HTMLFieldProcessor';

export class HTMLHeaderGenerator {
  private fieldProcessor = new HTMLFieldProcessor();

  generateHeaderHTML(profile: any, layoutConfig: any, fieldMappings: any[]): string {
    console.log('=== HEADER GENERATION DEBUG ===');
    
    // Process header fields with debugging
    const fullName = this.fieldProcessor.processFieldWithDebug(
      `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(), 
      'full_name', 
      'general', 
      fieldMappings
    );
    
    const email = this.fieldProcessor.processFieldWithDebug(profile?.email, 'email', 'general', fieldMappings);
    const phone = this.fieldProcessor.processFieldWithDebug(profile?.phone, 'phone', 'general', fieldMappings);
    const location = this.fieldProcessor.processFieldWithDebug(profile?.location, 'location', 'general', fieldMappings);
    const currentPosition = this.fieldProcessor.processFieldWithDebug(profile?.current_position, 'current_position', 'general', fieldMappings);
    const biography = this.fieldProcessor.processFieldWithDebug(profile?.biography, 'biography', 'general', fieldMappings);
    const profileImage = this.fieldProcessor.processFieldWithDebug(profile?.profile_image, 'profile_image', 'general', fieldMappings);
    
    console.log('Header processed fields:', {
      fullName, email, phone, location, currentPosition, biography, profileImage
    });
    
    const contactInfo = [];
    if (email !== null) contactInfo.push(`<span>📧 ${email}</span>`);
    if (phone !== null) contactInfo.push(`<span>📞 ${phone}</span>`);
    if (location !== null) contactInfo.push(`<span>📍 ${location}</span>`);
    
    return `
        <div class="header">
            <div class="header-content">
                ${fullName !== null ? `<div class="name">${fullName || 'Your Name'}</div>` : ''}
                ${currentPosition !== null ? `<div class="title">${currentPosition}</div>` : ''}
                ${contactInfo.length > 0 ? `<div class="contact-info">${contactInfo.join('')}</div>` : ''}
                ${biography !== null ? `<div class="biography">${this.fieldProcessor.processRichText(biography)}</div>` : ''}
            </div>
            ${profileImage !== null && profileImage ? `<img src="${profileImage}" alt="Profile" class="profile-image" />` : ''}
        </div>
    `;
  }
}
