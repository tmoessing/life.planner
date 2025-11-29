import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';
import { useMemo, memo } from 'react';

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutItemProps {
  shortcut: { key: string; description: string; highlight?: boolean };
}

// Use a proper React component instead of a render function to avoid ref composition issues
const ShortcutItem = memo(({ shortcut }: ShortcutItemProps) => (
  <div className="flex items-start gap-3 py-1.5">
    <Badge 
      variant={shortcut.highlight ? "default" : "outline"} 
      className="font-mono min-w-[80px] justify-center"
    >
      {shortcut.key}
    </Badge>
    <span className="text-sm text-muted-foreground flex-1">{shortcut.description}</span>
  </div>
));
ShortcutItem.displayName = 'ShortcutItem';

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  const shortcuts = useMemo(() => ({
    general: [
      { key: '?', description: 'Open this help modal', highlight: true },
      { key: 'F', description: 'Focus filter/search bar' },
      { key: 'Esc', description: 'Close modals or clear selections' },
    ],
    view: [
      { key: '1', description: 'Switch to Sprint View' },
      { key: '2', description: 'Switch to Story Boards' },
      { key: '3', description: 'Switch to Importance List' },
      { key: '4', description: 'Switch to Planner' },
    ],
    section: [
      { key: 'D', description: 'Toggle chart section' },
      { key: 'R', description: 'Toggle roadmap section' },
      { key: 'B', description: 'Toggle board section' },
    ],
    story: [
      { key: 'Enter', description: 'Edit focused/selected story' },
      { key: 'E', description: 'Edit selected story (when story is selected)' },
      { key: 'C', description: 'Add selected story to Google Calendar' },
      { key: 'Del / Backspace', description: 'Delete selected story' },
      { key: '↑ ↓ ← →', description: 'Navigate between stories and columns' },
    ],
    multiSelect: [
      { key: 'Ctrl/Cmd + Click', description: 'Select multiple stories' },
      { key: 'Shift + Click', description: 'Select range of stories' },
      { key: 'Drag selected', description: 'Move all selected stories together' },
    ],
    form: [
      { key: 'Ctrl/Cmd + Enter', description: 'Submit form (in add/edit views)' },
      { key: 'Tab', description: 'Navigate to next field' },
      { key: 'Shift + Tab', description: 'Navigate to previous field' },
    ],
  }), []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts & Help
          </DialogTitle>
          <DialogDescription>
            Press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">?</kbd> to open this help menu anytime. Use these shortcuts to navigate and interact with the app more efficiently.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* General Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {shortcuts.general.map((shortcut) => (
                  <ShortcutItem key={shortcut.key} shortcut={shortcut} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* View Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">View Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {shortcuts.view.map((shortcut) => (
                  <ShortcutItem key={shortcut.key} shortcut={shortcut} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section Toggles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Section Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {shortcuts.section.map((shortcut) => (
                  <ShortcutItem key={shortcut.key} shortcut={shortcut} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Story Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Story Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {shortcuts.story.map((shortcut) => (
                  <ShortcutItem key={shortcut.key} shortcut={shortcut} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Multi-select Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Multi-select & Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {shortcuts.multiSelect.map((shortcut) => (
                  <ShortcutItem key={shortcut.key} shortcut={shortcut} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Form Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {shortcuts.form.map((shortcut) => (
                  <ShortcutItem key={shortcut.key} shortcut={shortcut} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filter Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filter Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <Badge variant="outline" className="font-mono mr-2">weight=3</Badge>
                  <span>Stories with weight 3</span>
                </div>
                <div>
                  <Badge variant="outline" className="font-mono mr-2">priority=Q1</Badge>
                  <span>Q1 priority stories</span>
                </div>
                <div>
                  <Badge variant="outline" className="font-mono mr-2">role=Student</Badge>
                  <span>Stories for Student role</span>
                </div>
                <div>
                  <Badge variant="outline" className="font-mono mr-2">type=Spiritual</Badge>
                  <span>Spiritual type stories</span>
                </div>
                <div>
                  <Badge variant="outline" className="font-mono mr-2">label=workout</Badge>
                  <span>Stories with workout label</span>
                </div>
                <div>
                  <Badge variant="outline" className="font-mono mr-2">sprint=current</Badge>
                  <span>Current sprint stories</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mobile Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>• Tap and hold to select multiple stories</p>
                <p>• Swipe to navigate between views</p>
                <p>• Pinch to zoom on charts</p>
                <p>• Use the sticky header for quick access</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
