import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bug, Lightbulb } from 'lucide-react';

interface TypeSelectorProps {
  onSelectType: (type: 'bug' | 'feature') => void;
  onViewExisting: () => void;
}

export function TypeSelector({ onSelectType, onViewExisting }: TypeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">How can we help?</h1>
        <p className="text-muted-foreground mt-2">
          Choose the type of feedback you'd like to provide
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bug className="h-5 w-5 text-destructive" />
              <CardTitle className="text-lg">Report a Bug</CardTitle>
            </div>
            <CardDescription>
              Something not working as expected? Let us know and we'll look into it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onSelectType('bug')}
            >
              Report Bug
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-lg">Request a Feature</CardTitle>
            </div>
            <CardDescription>
              Have an idea to improve our platform? We'd love to hear it!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onSelectType('feature')}
            >
              Request Feature
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-2">
        <Button 
          variant="link" 
          onClick={onViewExisting}
          className="text-muted-foreground"
        >
          View existing feedback and issues
        </Button>
      </div>
    </div>
  );
}
