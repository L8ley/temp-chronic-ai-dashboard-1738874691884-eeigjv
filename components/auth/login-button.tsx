"use client";

import { useState } from "react";
import { AuthDialog } from "./auth-dialog";

interface LoginButtonProps {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
}

export function LoginButton({
  children,
  mode = "modal",
  asChild = false,
}: LoginButtonProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  if (mode === "modal") {
    return (
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        trigger={<div onClick={() => setShowAuthDialog(true)}>{children}</div>}
      />
    );
  }

  return children;
}
