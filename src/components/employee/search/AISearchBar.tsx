
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Search, Loader2, AlertCircle } from 'lucide-react';
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

  const exampleQueries = [
    "React developers from Google",
    "Senior engineers with 5+ years experience",
    "MIT computer science graduates",
    "AWS certified developers",
    "Project managers with incomplete profiles"
  ];

  return (
    <div className="space-y-4">
      <form onSubmit={handleAISearch} className="flex gap-2">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Sparkles className="h-4 w-4 text-purple-500" />
          </div>
          <Input
            type="text"
            placeholder="Ask AI: 'Find React developers from Google' or 'Senior engineers with 5+ years'"
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

      {/* Example queries */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-500 flex items-center">
          <Sparkles className="h-3 w-3 mr-1" />
          Try:
        </span>
        {exampleQueries.slice(0, 3).map((example, index) => (
          <button
            key={index}
            onClick={() => setQuery(example)}
            disabled={disabled || isProcessing}
            className="text-xs px-2 py-1 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-800/50 rounded-full text-purple-700 dark:text-purple-300 transition-colors"
          >
            "{example}"
          </button>
        ))}
      </div>

      {/* AI Interpretation Display */}
      {lastResult && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 space-y-2">
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
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(lastResult.filters).map(([key, value]) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {key.replace(/_/g, ' ')}: {String(value)}
                </Badge>
              ))}
            </div>
          )}
          
          {lastResult.confidence < 0.7 && (
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3 w-3" />
              <span className="text-xs">Low confidence - consider using manual search for better results</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AISearchBar;
