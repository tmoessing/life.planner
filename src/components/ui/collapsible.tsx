import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface CollapsibleProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Collapsible({ 
  title, 
  description, 
  icon, 
  children, 
  defaultOpen = false,
  className 
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border rounded-lg", className)}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between p-3 sm:p-4 h-auto hover:bg-muted/50 min-h-[60px] sm:min-h-[70px]"
      >
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 text-left flex-1 min-w-0">
          {icon && <div className="flex-shrink-0 mt-0.5 sm:mt-0">{icon}</div>}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm sm:text-base leading-tight">{title}</h3>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">{description}</p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 ml-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </Button>
      
      {isOpen && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
