
import React from 'react';
import { PlaceholderImageManager } from './PlaceholderImageManager';

export const PlaceholderImageSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Placeholder Images</h2>
        <p className="text-muted-foreground">
          Manage placeholder images that can be used in CV templates. These images are publicly accessible 
          and can be referenced in your HTML templates using their public URLs.
        </p>
      </div>
      
      <PlaceholderImageManager />
      
      <div className="bg-muted/30 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Usage in CV Templates</h3>
        <p className="text-sm text-muted-foreground mb-3">
          You can use these placeholder images in your CV templates by referencing their public URLs. 
          Copy the URL of any image and use it in your HTML templates like this:
        </p>
        <code className="block bg-background p-2 rounded text-xs border">
          {`<img src="https://pvkzzkbwjntazemosbot.supabase.co/storage/v1/object/public/placeholder-images/your-image-name.jpg" alt="Placeholder" />`}
        </code>
      </div>
    </div>
  );
};
