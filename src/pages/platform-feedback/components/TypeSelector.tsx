import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bug, Lightbulb, MessageSquareCode } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface TypeSelectorProps {
  onSelectType: (type: 'bug' | 'feature') => void;
  onViewExisting: () => void;
}

export function TypeSelector({ onSelectType, onViewExisting }: TypeSelectorProps) {
  return (
    <div className="space-y-10 flex flex-col items-center min-h-[70vh] justify-center">
      {/* Friendly illustration and headline */}
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-primary mb-2 tracking-tight">We value your feedback!</h1>
        <p className="text-muted-foreground mt-2 max-w-lg text-center text-base">
          Help us improve by reporting bugs or sharing your ideas.<br />
          Your feedback makes our platform better for everyone.
        </p>
      </div>

      <TooltipProvider>
        <div className="grid gap-8 md:grid-cols-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card
                className="group hover:shadow-lg hover:border-primary border-1 border-transparent transition-all cursor-pointer bg-gradient-to-br from-red-50/60 to-white"
                tabIndex={0}
                role="button"
                aria-label="Report a Bug"
                onClick={() => onSelectType('bug')}
                onKeyPress={e => { if (e.key === 'Enter') onSelectType('bug'); }}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <span className="rounded-full bg-destructive/10 p-2">
                      <Bug className="h-7 w-7 text-destructive group-hover:animate-bounce" />
                    </span>
                    <CardTitle className="text-xl font-semibold">Report a Bug</CardTitle>
                  </div>
                  <CardDescription className="mt-2 text-base">
                    Something not working as expected? Let us know and we'll look into it.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="destructive" 
                    className="w-full font-semibold group-hover:scale-105 transition-transform"
                    onClick={e => { e.stopPropagation(); onSelectType('bug'); }}
                  >
                    Report Bug
                  </Button>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <span>Found a problem or error? Click to report a bug.</span>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card
                className="group hover:shadow-lg hover:border-primary border-1 border-transparent transition-all cursor-pointer bg-gradient-to-br from-yellow-50/60 to-white"
                tabIndex={0}
                role="button"
                aria-label="Request a Feature"
                onClick={() => onSelectType('feature')}
                onKeyPress={e => { if (e.key === 'Enter') onSelectType('feature'); }}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <span className="rounded-full bg-yellow-100 p-2">
                      <Lightbulb className="h-7 w-7 text-yellow-500 group-hover:animate-bounce" />
                    </span>
                    <CardTitle className="text-xl font-semibold">Request a Feature</CardTitle>
                  </div>
                  <CardDescription className="mt-2 text-base">
                    Have an idea to improve our platform? We'd love to hear it!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full font-semibold group-hover:scale-105 transition-transform"
                    onClick={e => { e.stopPropagation(); onSelectType('feature'); }}
                  >
                    Request Feature
                  </Button>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <span>Share your ideas for new features or improvements.</span>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <div className="text-center mt-6">
        <Button
          variant="ghost"
          onClick={onViewExisting}
          className="inline-flex items-center gap-2 text-primary font-semibold text-base px-4 py-2 rounded-full bg-primary/5 hover:bg-primary/10 transition-all shadow-sm hover:shadow-md border border-primary/20"
        >
          <MessageSquareCode className="h-7 w-7 text-destructive group-hover:animate-bounce" />
          View existing feedback and issues
        </Button>
      </div>
    </div>
  );
}
