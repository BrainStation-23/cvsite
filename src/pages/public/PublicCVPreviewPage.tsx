
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const PublicCVPreviewPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cvHtml, setCvHtml] = useState<string | null>(null);

  useEffect(() => {
    const loadCVPreview = async () => {
      if (!token) {
        setError('Invalid preview link');
        setIsLoading(false);
        return;
      }

      try {
        // Call the public CV preview edge function
        const response = await fetch(
          `https://pvkzzkbwjntazemosbot.supabase.co/functions/v1/public-cv-preview/${token}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'text/html',
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load CV preview');
        }

        const html = await response.text();
        setCvHtml(html);
      } catch (err) {
        console.error('Error loading CV preview:', err);
        setError('Failed to load CV preview. The link may have expired or is invalid.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCVPreview();
  }, [token]);

  const handleDownloadPDF = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-lg font-medium">Loading CV Preview...</p>
        </div>
      </div>
    );
  }

  if (error || !cvHtml) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 max-w-md p-6">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">
            {error || 'This CV preview link has expired or is invalid.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with controls */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">CV Preview</h1>
            <p className="text-sm text-gray-600">Public CV Preview</p>
          </div>
          <Button onClick={handleDownloadPDF} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* CV Content */}
      <div 
        className="cv-preview-content"
        dangerouslySetInnerHTML={{ __html: cvHtml }}
      />

      {/* Print styles */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .cv-preview-content {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicCVPreviewPage;
