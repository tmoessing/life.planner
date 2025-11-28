import React from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Home, Target, BookOpen, FolderOpen, Calendar, GraduationCap } from 'lucide-react';
import type { ViewType } from '@/constants/views';
import { settingsAtom } from '@/stores/settingsStore';

interface MobileBottomNavProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export function MobileBottomNav({ currentView, setCurrentView }: MobileBottomNavProps) {
  const [settings] = useAtom(settingsAtom);
  
  const baseNavItems = [
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'sprint', label: 'Stories', icon: BookOpen },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
  ];
  
  const lastNavItem = settings.layout.sections.classes
    ? { id: 'classes', label: 'Class', icon: GraduationCap }
    : { id: 'bucketlist', label: 'Bucketlist', icon: Home };
  
  const mobileNavItems = [...baseNavItems, lastNavItem];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around py-2 safe-area-left safe-area-right">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2 px-2 touch-target min-w-0 flex-1"
              onClick={() => setCurrentView(item.id as ViewType)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs leading-tight">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
