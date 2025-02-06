import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [showTools, setShowTools] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className={cn("group relative flex gap-4", isUser && "flex-row-reverse")}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? (
          <Icons.user className="h-4 w-4" />
        ) : (
          <Icons.brain className="h-4 w-4" />
        )}
      </motion.div>
      <motion.div
        initial={{ scale: 0.9, x: isUser ? 20 : -20 }}
        animate={{ scale: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "flex flex-col gap-1 min-w-0 max-w-[80%]",
          isUser && "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none break-words">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
          {!isUser && message.usedTools && message.usedTools.length > 0 && (
            <div className="mt-2 border-t border-border/50 pt-2">
              <button
                onClick={() => setShowTools(!showTools)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icons.tool className="h-3 w-3" />
                <span>
                  {showTools ? "Hide" : "Show"} Tools ({message.usedTools.length})
                </span>
                <Icons.chevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    showTools && "rotate-180"
                  )}
                />
              </button>
              {showTools && (
                <div className="mt-2 space-y-2">
                  {message.usedTools.map((tool, index) => (
                    <div
                      key={index}
                      className="rounded bg-background/50 p-2 text-xs"
                    >
                      <div className="font-medium">{tool.tool}</div>
                      <div className="mt-1 text-muted-foreground">
                        <div>Input: {JSON.stringify(tool.toolInput)}</div>
                        <div>Output: {tool.toolOutput}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {message.status && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs"
          >
            {message.status === "sending" && (
              <Icons.spinner className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
            {message.status === "error" && (
              <Icons.alertCircle className="h-3 w-3 text-destructive" />
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
