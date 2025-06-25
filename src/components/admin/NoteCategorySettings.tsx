
import React, { useState, KeyboardEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle, HelpCircle, Zap, Star, Heart, Bell } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useNoteCategorySettings } from '@/hooks/use-note-category-settings';

const NoteCategorySettings: React.FC = () => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState<string>('');
  
  const { 
    categories, 
    isLoading, 
    addCategory, 
    removeCategory, 
    isAddingCategory, 
    isRemovingCategory 
  } = useNoteCategorySettings();

  // Available icons similar to toast/alert types
  const availableIcons = [
    { value: 'AlertCircle', label: 'Alert Circle', icon: AlertCircle },
    { value: 'AlertTriangle', label: 'Warning', icon: AlertTriangle },
    { value: 'Info', label: 'Info', icon: Info },
    { value: 'CheckCircle', label: 'Success', icon: CheckCircle },
    { value: 'HelpCircle', label: 'Help', icon: HelpCircle },
    { value: 'Zap', label: 'Lightning', icon: Zap },
    { value: 'Star', label: 'Star', icon: Star },
    { value: 'Heart', label: 'Heart', icon: Heart },
    { value: 'Bell', label: 'Bell', icon: Bell },
  ];

  const getIconComponent = (iconName: string) => {
    const iconData = availableIcons.find(icon => icon.value === iconName);
    if (iconData) {
      const IconComponent = iconData.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <AlertCircle className="h-4 w-4" />;
  };
  
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    addCategory(newCategoryName.trim(), newCategoryIcon);
    setNewCategoryName('');
    setNewCategoryIcon('');
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isAddingCategory && newCategoryName.trim()) {
      e.preventDefault();
      handleAddCategory();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Note Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <Input 
            placeholder="Category name..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Select value={newCategoryIcon} onValueChange={setNewCategoryIcon}>
            <SelectTrigger>
              <SelectValue placeholder="Select an icon (optional)" />
            </SelectTrigger>
            <SelectContent>
              {availableIcons.map((icon) => {
                const IconComponent = icon.icon;
                return (
                  <SelectItem key={icon.value} value={icon.value}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      {icon.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleAddCategory}
            disabled={isAddingCategory || !newCategoryName.trim()}
            className="w-full"
          >
            {isAddingCategory ? 'Adding...' : 'Add Category'}
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-2">
            {categories?.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md"
              >
                <div className="flex items-center gap-2">
                  {category.icon && getIconComponent(category.icon)}
                  <span>{category.name}</span>
                </div>
                <button 
                  onClick={() => removeCategory(category.id, category.name)}
                  className="text-gray-500 hover:text-red-500"
                  disabled={isRemovingCategory}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {categories?.length === 0 && (
              <p className="text-gray-500 text-center py-4">No categories created yet</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NoteCategorySettings;
