export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
  isStreaming?: boolean;
  usedTools?: Array<{
    tool: string;
    toolInput: Record<string, any>;
    toolOutput: string;
  }>;
} 