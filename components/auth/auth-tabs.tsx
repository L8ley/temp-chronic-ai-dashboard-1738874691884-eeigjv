"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "./login-form";
import { SignUpForm } from "./signup-form";
import { motion } from "framer-motion";

interface AuthTabsProps {
  onSuccess?: () => void;
}

export function AuthTabs({ onSuccess }: AuthTabsProps) {
  return (
    <div className="px-6 pb-6">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TabsContent value="login" className="mt-0">
            <LoginForm onSuccess={onSuccess} />
          </TabsContent>
          <TabsContent value="signup" className="mt-0">
            <SignUpForm onSuccess={onSuccess} />
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}
