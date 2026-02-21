"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CreateChoiceDialogProps {
  trigger: React.ReactNode;
  onFirstButtonClick: () => void;
  firstButtonTittle?: string;
  secondButtonTittle?: string;
  onSecondButtonClick: () => void;
}

export const CreateChoiceDialog = ({
  trigger,
  onFirstButtonClick,
  onSecondButtonClick,
  firstButtonTittle,
  secondButtonTittle
  ,
}: CreateChoiceDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select what you want to create</DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onFirstButtonClick} className="w-full sm:w-auto">
            {firstButtonTittle}
          </Button>
          <Button variant="outline" onClick={onSecondButtonClick} className="w-full sm:w-auto">
            {secondButtonTittle}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
