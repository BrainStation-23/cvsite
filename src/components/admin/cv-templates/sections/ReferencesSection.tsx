
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSectionFieldConfig } from '@/hooks/use-section-field-config';

interface Reference {
  id: string;
  name: string;
  email?: string;
  designation?: string;
  company?: string;
}

interface ReferencesSectionProps {
  profile?: any;
  styles?: any;
  fieldMappings?: any[];
  sectionConfig?: any;
  customTitle?: string;
}

export const ReferencesSection: React.FC<ReferencesSectionProps> = ({
  profile,
  styles = {},
  fieldMappings = [],
  sectionConfig,
  customTitle
}) => {
  const [references, setReferences] = useState<Reference[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const defaultFields = [
    { field: 'name', label: 'Name', enabled: true, masked: false, order: 1 },
    { field: 'designation', label: 'Designation', enabled: true, masked: false, order: 2 },
    { field: 'company', label: 'Company', enabled: true, masked: false, order: 3 },
    { field: 'email', label: 'Email', enabled: true, masked: false, order: 4 }
  ];

  const { orderedFields, isFieldEnabled, applyMasking, sectionTitle } = useSectionFieldConfig({
    sectionType: 'references',
    fieldMappings,
    sectionConfig,
    defaultFields
  });

  useEffect(() => {
    fetchReferences();
  }, []);

  const fetchReferences = async () => {
    try {
      const { data, error } = await supabase
        .from('references')
        .select('*')
        .order('name');

      if (error) throw error;
      setReferences(data || []);
    } catch (error) {
      console.error('Error fetching references:', error);
      setReferences([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
        Loading references...
      </div>
    );
  }

  if (!references || references.length === 0) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
        No references available
      </div>
    );
  }

  const title = customTitle || sectionTitle || 'References';

  return (
    <div style={{ marginBottom: '24px', ...styles.section }}>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: 'bold', 
        marginBottom: '16px',
        borderBottom: '1px solid #ccc',
        paddingBottom: '8px',
        ...styles.sectionTitle 
      }}>
        {title}
      </h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
        ...styles.referenceGrid 
      }}>
        {references.map((reference, index) => (
          <div key={reference.id} style={{ 
            padding: '12px',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            backgroundColor: '#fafafa',
            ...styles.referenceItem 
          }}>
            {orderedFields.map((field) => {
              if (!isFieldEnabled(field.field)) return null;
              
              const value = reference[field.field as keyof Reference];
              if (!value) return null;

              const displayValue = applyMasking(value, field.field);

              return (
                <div key={field.field} style={{ marginBottom: '4px' }}>
                  <span style={{ 
                    fontWeight: field.field === 'name' ? 'bold' : 'normal',
                    fontSize: field.field === 'name' ? '14px' : '12px',
                    color: field.field === 'name' ? '#333' : '#666',
                    ...styles.referenceField 
                  }}>
                    {field.field === 'name' ? displayValue : `${field.label}: ${displayValue}`}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
