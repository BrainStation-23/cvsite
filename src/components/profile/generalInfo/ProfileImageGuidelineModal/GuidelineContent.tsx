
import React from 'react';
import { REQUIREMENTS, EXAMPLES } from './constants';

const GuidelineContent: React.FC = () => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Requirements
        </h3>
        <ul className="list-disc pl-4 text-xs text-gray-700 dark:text-gray-300 space-y-1">
          {REQUIREMENTS.map((requirement, index) => (
            <li key={index}>{requirement}</li>
          ))}
        </ul>
      </div>

      {/* Compact Examples */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Examples</h4>
        <div className="grid grid-cols-2 gap-2">
          {EXAMPLES.map(example => (
            <div key={example.label} className="space-y-1">
              <div className={`aspect-square rounded-md overflow-hidden border ${example.border} bg-gray-100`}>
                <img 
                  src={example.src} 
                  alt={example.label} 
                  className="object-cover w-full h-full" 
                />
              </div>
              <div className="text-center">
                <span className={`text-xs font-semibold ${example.color}`}>
                  {example.label}
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {example.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidelineContent;
