
import React, { useState, KeyboardEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { usePlatformSettings, SettingTableName } from '@/hooks/use-platform-settings';

interface SettingCategoryProps {
  title: string;
  table: SettingTableName;
}

const SettingCategory: React.FC<SettingCategoryProps> = ({ title, table }) => {
  const [newValue, setNewValue] = useState('');
  const { 
    items, 
    isLoading, 
    addItem, 
    removeItem, 
    isAddingItem, 
    isRemovingItem 
  } = usePlatformSettings(table);
  
  const handleAddItems = () => {
    if (!newValue.trim()) return;
    
    // Split by comma and trim each item
    const values = newValue
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    // Add each item
    values.forEach(value => {
      addItem(value);
    });
    
    // Clear the input
    setNewValue('');
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isAddingItem && newValue.trim()) {
      e.preventDefault();
      handleAddItems();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <Input 
            placeholder={`Add new ${title.toLowerCase().slice(0, -1)}...`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mr-2"
          />
          <Button 
            onClick={handleAddItems}
            disabled={isAddingItem || !newValue.trim()}
          >
            {isAddingItem ? 'Adding...' : 'Add'}
          </Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items?.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md"
              >
                <span>{item.name}</span>
                <button 
                  onClick={() => removeItem(item.id, item.name)}
                  className="ml-2 text-gray-500 hover:text-red-500"
                  disabled={isRemovingItem}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SettingCategory;
