import Papa from 'papaparse';
import { UniversityFormData } from '@/hooks/use-university-settings';

export interface UniversityCSVRow {
  name: string;
  type: 'public' | 'private';
  acronyms?: string;
}

export const downloadCSVTemplate = () => {
  const templateData = [
    {
      name: 'Harvard University',
      type: 'private',
      acronyms: 'HU'
    },
    {
      name: 'University of California, Berkeley',
      type: 'public',
      acronyms: 'UC Berkeley, UCB'
    },
    {
      name: 'Massachusetts Institute of Technology',
      type: 'private',
      acronyms: 'MIT'
    }
  ];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'university_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportUniversitiesToCSV = (universities: any[]) => {
  const csvData = universities.map(university => ({
    name: university.name,
    type: university.type,
    acronyms: university.acronyms || ''
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `universities_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const parseUniversitiesCSV = (file: File): Promise<UniversityFormData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const universities: UniversityFormData[] = results.data
            .filter((row: any) => row.name && row.name.trim() !== '')
            .map((row: any) => ({
              name: row.name.trim(),
              type: (row.type === 'private' ? 'private' : 'public') as 'public' | 'private',
              acronyms: row.acronyms ? row.acronyms.trim() : ''
            }));
          resolve(universities);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
