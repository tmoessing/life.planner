import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  itemName?: string;
  isDeleting?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isDeleting = false
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!static !translate-x-0 !translate-y-0 !left-auto !right-auto !top-auto !bottom-auto !inset-auto !m-auto !w-[90vw] sm:!w-auto sm:max-w-[280px] max-w-[280px] p-4 sm:p-5 !h-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-0.5 text-xs">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="py-2">
          <p className="text-xs text-muted-foreground">
            {itemName && (
              <>
                Are you sure you want to delete <span className="font-medium text-foreground">"{itemName}"</span>?
                <br /><br />
              </>
            )}
            This action cannot be undone.
          </p>
        </div>

        <DialogFooter className="gap-2 flex-row sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            size="sm"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            size="sm"
            className="gap-1.5 flex-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
