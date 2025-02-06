"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AuthTabs } from "./auth-tabs";
import { Icons } from "@/components/icons";

interface AuthDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function AuthDialog({ open, onOpenChange, trigger }: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <div className="relative flex flex-col items-center justify-center space-y-4 bg-gradient-to-b from-muted/50 to-muted p-6 pt-8">
          <div className="absolute top-4 left-4 flex items-center text-lg font-semibold">
            <Icons.brain className="mr-2 h-6 w-6" />
            chronic.ai
          </div>
          <div className="relative h-24 w-24 rounded-full bg-background p-4 shadow-lg">
            <Icons.user className="h-full w-full text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>
        </div>
        <AuthTabs onSuccess={() => onOpenChange?.(false)} />
      </DialogContent>
    </Dialog>
  );
}
