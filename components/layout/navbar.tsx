"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Icons.brain className="h-6 w-6" />
            <span className="font-bold">chronic.ai</span>
          </Link>
        </div>
        <nav className="flex items-center justify-between space-x-6">
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/features"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/features"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/pricing"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Pricing
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            {user ? (
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            ) : (
              <LoginButton>
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </LoginButton>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
