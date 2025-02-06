"use client";

import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";
import { Icons } from "@/components/icons";
import { PageTransition } from "@/components/page-transition";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

export default function Home() {
  const { user } = useAuth();
  
  return (
    <PageTransition>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <main className="flex-1 w-full">
          <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
            <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto">
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-1 text-sm font-medium">
                <Icons.sparkles className="h-4 w-4" />
                <span>Introducing chronic.ai</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
                Your Intelligent AI Companion
              </h1>
              <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                Experience the future of AI assistance. Powered by advanced
                language models, chronic.ai helps you work smarter, faster, and
                more efficiently.
              </p>
              <div className="flex gap-4">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="min-w-[150px]">
                      <Icons.dashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <LoginButton>
                    <Button size="lg" className="min-w-[150px]">
                      Get Started
                    </Button>
                  </LoginButton>
                )}
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            </div>
          </section>

          <section className="container space-y-6 py-8 md:py-12 lg:py-24 mx-auto">
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
              <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <Icons.brain className="h-12 w-12" />
                  <div className="space-y-2">
                    <h3 className="font-bold">Advanced AI</h3>
                    <p className="text-sm text-muted-foreground">
                      State-of-the-art language models for intelligent
                      conversations.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <Icons.shield className="h-12 w-12" />
                  <div className="space-y-2">
                    <h3 className="font-bold">Secure & Private</h3>
                    <p className="text-sm text-muted-foreground">
                      Enterprise-grade security with end-to-end encryption.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <Icons.zap className="h-12 w-12" />
                  <div className="space-y-2">
                    <h3 className="font-bold">Lightning Fast</h3>
                    <p className="text-sm text-muted-foreground">
                      Real-time responses and instant knowledge access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </PageTransition>
  );
}
