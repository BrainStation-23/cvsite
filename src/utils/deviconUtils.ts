
export interface DeviconTechnology {
  name: string;
  altnames: string[];
  tags: string[];
  versions: {
    svg: string[];
    font: string[];
  };
  color: string;
  aliases: Array<{
    base: string;
    alias: string;
  }>;
}

export class DeviconService {
  private static technologies: DeviconTechnology[] = [];
  private static isLoading = false;
  private static hasLoaded = false;
  private static error: string | null = null;

  static async getTechnologies(): Promise<{
    technologies: DeviconTechnology[];
    isLoading: boolean;
    error: string | null;
  }> {
    if (this.hasLoaded) {
      return {
        technologies: this.technologies,
        isLoading: false,
        error: this.error
      };
    }

    if (this.isLoading) {
      // Wait for the current request to complete
      await new Promise(resolve => {
        const checkLoading = () => {
          if (!this.isLoading) {
            resolve(true);
          } else {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      });
      
      return {
        technologies: this.technologies,
        isLoading: false,
        error: this.error
      };
    }

    this.isLoading = true;
    this.error = null;

    try {
      const response = await fetch('https://raw.githubusercontent.com/devicons/devicon/master/devicon.json');
      if (!response.ok) {
        throw new Error('Failed to fetch technologies');
      }
      const data: DeviconTechnology[] = await response.json();
      this.technologies = data;
      this.hasLoaded = true;
    } catch (err) {
      console.error('Error fetching technologies:', err);
      this.error = 'Failed to load technologies';
      // Fallback to a basic list if API fails
      this.technologies = [
        { name: 'javascript', altnames: ['js'], tags: ['programming'], versions: { svg: ['original'], font: ['plain'] }, color: '#f7df1e', aliases: [] },
        { name: 'typescript', altnames: ['ts'], tags: ['programming'], versions: { svg: ['original'], font: ['plain'] }, color: '#3178c6', aliases: [] },
        { name: 'react', altnames: ['reactjs'], tags: ['framework'], versions: { svg: ['original'], font: ['plain'] }, color: '#61dafb', aliases: [] },
        { name: 'nodejs', altnames: ['node'], tags: ['runtime'], versions: { svg: ['original'], font: ['plain'] }, color: '#339933', aliases: [] },
        { name: 'python', altnames: [], tags: ['programming'], versions: { svg: ['original'], font: ['plain'] }, color: '#3776ab', aliases: [] }
      ];
      this.hasLoaded = true;
    } finally {
      this.isLoading = false;
    }

    return {
      technologies: this.technologies,
      isLoading: false,
      error: this.error
    };
  }

  static filterTechnologies(searchTerm: string, technologies: DeviconTechnology[], limit: number = 15): DeviconTechnology[] {
    if (!searchTerm.trim()) return [];
    
    const searchLower = searchTerm.toLowerCase();
    
    return technologies.filter(tech => {
      // Search in name
      if (tech.name.toLowerCase().includes(searchLower)) return true;
      
      // Search in altnames
      if (tech.altnames.some(alt => alt.toLowerCase().includes(searchLower))) return true;
      
      // Search in tags
      if (tech.tags.some(tag => tag.toLowerCase().includes(searchLower))) return true;
      
      return false;
    }).slice(0, limit);
  }

  static getDeviconUrl(techName: string): string {
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${techName.toLowerCase()}/${techName.toLowerCase()}-original.svg`;
  }

  static getDisplayName(tech: DeviconTechnology): string {
    // Use the most common altname if available, otherwise use the name
    if (tech.altnames.length > 0) {
      return tech.altnames[0];
    }
    return tech.name;
  }
}
