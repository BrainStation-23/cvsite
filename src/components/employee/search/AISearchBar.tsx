
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Search, Loader2, AlertCircle, Calendar, Users, Award, Building, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AISearchBarProps {
  onAISearch: (filters: any) => void;
  isLoading: boolean;
  disabled?: boolean;
}

interface AISearchResult {
  filters: Record<string, any>;
  confidence: number;
  explanation: string;
  originalQuery: string;
}

const AISearchBar: React.FC<AISearchBarProps> = ({
  onAISearch,
  isLoading,
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<AISearchResult | null>(null);
  const { toast } = useToast();

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Empty query",
        description: "Please enter a search query",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Sending AI search query:', query);
      
      const { data, error } = await supabase.functions.invoke('ai-search-query', {
        body: { query: query.trim() }
      });

      if (error) {
        console.error('AI search error:', error);
        throw error;
      }

      console.log('AI search response:', data);
      
      setLastResult(data);
      
      // Apply the AI-generated filters
      onAISearch(data.filters);
      
      toast({
        title: "AI Search Complete",
        description: data.explanation,
      });

    } catch (error) {
      console.error('Error performing AI search:', error);
      toast({
        title: "AI Search Error",
        description: error.message || "Failed to process AI search. Try manual search instead.",
        variant: "destructive"
      });
      
      // Fallback to basic search
      onAISearch({ search_query: query });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearQuery = () => {
    setQuery('');
    setLastResult(null);
  };

  const handleExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  // Enhanced example queries covering all search capabilities
  const exampleQueries = [
    // Skills & Experience
    "Senior React developers with 5+ years",
    "Available Python developers",
    "Machine learning engineers from Google",
    
    // Resource Planning
    "80% billable resources available next month", 
    "Developers with less than 50% engagement",
    "Available consultants releasing in Q1",
    
    // Education & Training
    "MIT computer science graduates",
    "AWS certified developers",
    "Developers with incomplete profiles",
    
    // Projects & Technology  
    "React projects using TypeScript",
    "Mobile app developers",
    "Full stack developers with Node.js experience"
  ];

  const getFilterIcon = (filterKey: string) => {
    switch (filterKey) {
      case 'skill_filter':
      case 'technology_filter':
        return <Award className="h-3 w-3" />;
      case 'experience_filter':
        return <Building className="h-3 w-3" />;
      case 'education_filter':
        return <GraduationCap className="h-3 w-3" />;
      case 'availability_status':
      case 'min_engagement_percentage':
      case 'max_engagement_percentage':
      case 'min_billing_percentage':
      case 'max_billing_percentage':
        return <Users className="h-3 w-3" />;
      case 'release_date_from':
      case 'release_date_to':
        return <Calendar className="h-3 w-3" />;
      default:
        return <Search className="h-3 w-3" />;
    }
  };

  const formatFilterValue = (key: string, value: any) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (key.includes('percentage')) {
      return `${value}%`;
    }
    if (key.includes('date')) {
      return new Date(value).toLocaleDateString();
    }
    if (key.includes('experience_years') || key.includes('graduation_year')) {
      return `${value}`;
    }
    return String(value);
  };

  const getFilterLabel = (key: string) => {
    const labels: Record<string, string> = {
      search_query: 'General Search',
      skill_filter: 'Skills',
      experience_filter: 'Experience',
      education_filter: 'Education',
      training_filter: 'Training',
      achievement_filter: 'Achievements',
      project_name_filter: 'Project Names',
      project_description_filter: 'Project Description',
      technology_filter: 'Technologies',
      current_project_search: 'Current Projects',
      min_experience_years: 'Min Experience',
      max_experience_years: 'Max Experience',
      min_graduation_year: 'From Year',
      max_graduation_year: 'To Year',
      completion_status: 'Profile Status',
      min_engagement_percentage: 'Min Engagement',
      max_engagement_percentage: 'Max Engagement',
      min_billing_percentage: 'Min Billing',
      max_billing_percentage: 'Max Billing',
      release_date_from: 'Available From',
      release_date_to: 'Available To',
      availability_status: 'Availability'
    };
    return labels[key] || key.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAISearch} className="flex gap-2">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Sparkles className="h-4 w-4 text-purple-500" />
          </div>
          <Input
            type="text"
            placeholder="Ask AI: 'Available React developers' or 'Senior engineers with 5+ years' or '80% billable resources'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={disabled || isProcessing}
            className="pl-10 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 focus:border-purple-400 dark:from-purple-900/20 dark:to-blue-900/20"
          />
          {query && (
            <button
              type="button"
              onClick={handleClearQuery}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
        <Button 
          type="submit" 
          disabled={!query.trim() || disabled || isProcessing || isLoading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              AI Search
            </>
          )}
        </Button>
      </form>

      {/* Enhanced Example queries with categories */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-purple-500" />
          <span className="text-xs text-gray-500">Try these examples:</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {exampleQueries.slice(0, 6).map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleQuery(example)}
              disabled={disabled || isProcessing}
              className="text-xs px-3 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-800/50 rounded-lg text-purple-700 dark:text-purple-300 transition-colors text-left"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>

      {/* AI Interpretation Display with enhanced filter visualization */}
      {lastResult && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                AI Interpretation
              </span>
            </div>
            <Badge 
              variant={lastResult.confidence > 0.8 ? "default" : lastResult.confidence > 0.6 ? "secondary" : "outline"}
              className="text-xs"
            >
              {Math.round(lastResult.confidence * 100)}% confident
            </Badge>
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {lastResult.explanation}
          </p>
          
          {Object.keys(lastResult.filters).length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Applied Filters:</span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(lastResult.filters).map(([key, value]) => (
                  <Badge key={key} variant="outline" className="text-xs flex items-center gap-1">
                    {getFilterIcon(key)}
                    {getFilterLabel(key)}: {formatFilterValue(key, value)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {lastResult.confidence < 0.7 && (
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
              <AlertCircle className="h-3 w-3" />
              <span className="text-xs">Low confidence - consider refining your query or using manual search</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AISearchBar;
