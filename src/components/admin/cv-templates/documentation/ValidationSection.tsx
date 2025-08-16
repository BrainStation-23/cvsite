
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ValidationSection: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Template Validation Rules</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <h4 className="text-sm font-medium text-red-800 mb-2">Required Elements</h4>
            <ul className="text-xs text-red-700 space-y-1">
              <li>✓ Root <code>.cv-container</code> element</li>
              <li>✓ At least one <code>.cv-section</code> with <code>data-section</code></li>
              <li>✓ Section headers use <code>.cv-section-header</code></li>
            </ul>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Recommended Practices</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Use <code>.cv-page-break-avoid</code> on important sections</li>
              <li>• Wrap related items in <code>.cv-item-group</code></li>
              <li>• Add <code>data-item</code> attributes for tracking</li>
            </ul>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <h4 className="text-sm font-medium text-green-800 mb-2">PDF Optimization Tips</h4>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Use <code>.cv-page-break-before</code> to force new pages</li>
              <li>• Avoid splitting individual <code>.cv-item</code> elements</li>
              <li>• Keep headers with their content using <code>page-break-after: avoid</code></li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
